const fs = require("fs")

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
      				      accept(html)
     				   }
    				})
				})
			}
		})
		
	return Promise.all(getScriptPromises)
}).then(function(scriptBodies){
	var dist = fs.createWriteStream("dist/mobile-debug.js")
	dist.write("(function(){")
	scriptBodies.forEach(function(body, index){
		dist.write("\n// file " + index + "\n" + body)
	})
	dist.write("})")
})
