const fs = require("fs")
const UglifyJS = require("uglify-es")
const CleanCSS = require('clean-css')
const minifier = new CleanCSS({
	compatibility: 'ie9,-properties.merging',
	returnPromise: false
})
const minifyCss = minifier.minify.bind(minifier)

var randomInt = function(start, stop){
    var actualStart, actualEnd, startZeroEnd
    if (typeof stop === "undefined" || start > stop){
        actualEnd = start
        actualStart = stop || 0
    }
    else {
        actualStart = start
        actualEnd = stop
    }

    startZeroEnd = actualEnd - actualStart
    var random = Math.round(-0.4999 + Math.random() * (startZeroEnd + 0.9998))
    return random + actualStart
}
var allowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
var generateId = function(length = 16){
    var id = allowedCharacters[randomInt(51)]
    for(var i = 1; i < length; i++){
        id += allowedCharacters[randomInt(62)]
    }
    return id
}

var stringReplaceAll = function(target, search, replacement) {
    return target.split(search).join(replacement);
};

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
		.match(/<script[^>]+>[^<]*<\/script>/gi)
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
	var scriptWhole = ""
	scriptBodies.forEach(function(file){
		if (file){
			scriptWhole += "\n// file " + file.src + "\n" + file.contents
		}
	})

	var basicBulk = `(function(){${scriptWhole}})()`
	var configurableBulk = `(function(init){var regex = RegExp('debug'); (regex.exec(document.location.search) || regex.exec(document.location.hash)) && init()})(function(){${scriptWhole}})`

	var dist = fs.createWriteStream("dist/mobile-debug.js")
	dist.write(basicBulk)
	var configurableDist = fs.createWriteStream("dist/mobile-debug.live.js")
	dist.write(configurableBulk)
	mangleAndSave(configurableBulk, "dist/mobile-debug.live.min.js")

	function mangleAndSave(code, saveLocation){
		var minified = UglifyJS.minify(code, {
			ecma: 5,
			mangle: {
				toplevel: true
			},
			compress: {
				properties: true,
				dead_code: true,
				unused: true
			}
		})

	  // we now begin manually cleaning the code by minifying the CSS that are inline but the real goal is to extract all the ID and class names so we can replace them with random strings
	  // the reason we do this is because the editor exists in the same realm as any user's window / document / context so we can mangle the CSS class names and stuff to help prevent any user CSS from the page the user is working on from leaking over to the editor or vice versa
	  var mangleIdClassLegth = 6
	  var mangleIdClassMap = {}
		var manuallyCleanCode = minified.code.replace(/(\\n|\\t|\s){2,}/gi, "")
		manuallyCleanCode = manuallyCleanCode.replace(/(styles\+=")([^"]+)/g, function(match, styleEquals, css){
			// todo: add mangle CSS ID and class name logic here
			// regex for matching clas names https://regex101.com/r/LVMrbv/2
	        var selectorsOnly = css.replace(/\{[^}]*\}/g, "")

	        selectorsOnly.replace(/([#\.>\s])([^#.{\s,>]+)/g, function(matched, type, classOrId){
	        	( type == "#" || type == "." ) && (mangleIdClassMap[classOrId] = generateId(mangleIdClassLegth))
	        })
			return styleEquals + minifyCss(css).styles
		})

		manuallyCleanCode
			.replace(/\w\.id=["']([^"']+)["']/g, function(matched, idName){
				mangleIdClassMap[idName] = generateId(mangleIdClassLegth)
				return matched
			})
			.replace(/class=["']([^"']+)/g, function(matched, classNames){
				classNames = classNames.split(" ")
				classNames.forEach(function(cls){
					if (cls){
						mangleIdClassMap[cls] = generateId(mangleIdClassLegth)
					}
				})
			})

	    console.log(mangleIdClassMap)

	    for(var replaceTarget in mangleIdClassMap){
	        var replaceWith = mangleIdClassMap[replaceTarget]
	        manuallyCleanCode = stringReplaceAll(manuallyCleanCode, replaceTarget, replaceWith)
	    }

		fs.writeFile(saveLocation, manuallyCleanCode, function(err){
			err && console.log(err)
		})
		//console.log(minified.code)
	}

}).catch(function(err){
	console.log(err)
})
