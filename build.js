const fs = require("fs")
const UglifyJS = require("uglify-es")

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
	
	var manuallyCleanCode = minified.code.replace(/\\n|\\t/gi, "")

	fs.writeFile("dist/mobile-debug.min.js", manuallyCleanCode, function(err){
		err && console.log(err)
	})
	//console.log(minified.code)
}).catch(function(err){
	console.log(err)
})
