const fs = require("fs")
const UglifyJS = require("uglify-es")
const CleanCSS = require('clean-css')
const minifier = new CleanCSS({
	compatibility: 'ie9,-properties.merging',
	returnPromise: false
})
const minifyCss = minifier.minify.bind(minifier)

// this is the build script for writing
new Promise(function(accept, reject){
    fs.readFile("index.html", "utf8",  function(o3o, html){
        if (o3o){
            reject(o3o)
        }
        else {
            accept(html)
        }
    })
}).then(function(html){
    var getScriptPromises = html
		.match(/<script[^>]+><\/script>/gi)
		.map(function(script){
			var srcMatch = script.match(/src=\"([^"]+)\"/i)
			if (srcMatch){
				return srcMatch[1]
			}
		})
		.map(function(src){
			if (src && src.match(/^src\//)){
				return new Promise(function(accept, reject){
					fs.readFile(src, "utf8", function(o3o, html){
      			 	 if (o3o){
     			 	      reject(o3o)
    			 	   }
   			 	    else {
      				      accept({
								src: src,
								contents: html
							})
     				   }
    				})
				})
			}
		})

	return Promise.all(getScriptPromises)
}).then(function(scriptBodies){
	var dist = fs.createWriteStream("dist/mobile-debug.js")
	var scriptWhole = "(function(){"
	scriptBodies.forEach(function(file){
		if (file){
			scriptWhole += "\n// file " + file.src + "\n" + file.contents
		}
	})
	scriptWhole += "})()"

	dist.write(scriptWhole)

	var minified = UglifyJS.minify(scriptWhole, {
		ecma: 5
	})

	var manuallyCleanCode = minified.code.replace(/\\n|\\t|\s{2,}/gi, "")
	manuallyCleanCode = manuallyCleanCode.replace(/(styles\+=")([^"]+)/g, function(match, styleEquals, css){
		// todo: add mangle CSS ID and class name logic here

		return styleEquals + minifyCss(css).styles
	})

	fs.writeFile("dist/mobile-debug.min.js", manuallyCleanCode, function(err){
		err && console.log(err)
	})
	//console.log(minified.code)
}).catch(function(err){
	console.log(err)
})
