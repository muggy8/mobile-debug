const fs = require("fs")

// this is the build script for writing
new Promise(function(accept, reject){
    fs.readFile('index.html', function(o3o, html){
        if (o3o){
            reject(o3o)
        }
        else {
            accept(html)
        }
    })
}).then(function(html){
    html.match(/<script[^>]+><\/script>/gi)
})
