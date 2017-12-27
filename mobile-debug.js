var inspect
new Promise(function(accept){
	// load dependencies here	
	var statelessJs = document.createElement("script")
	statelessJs.onload = statelessJs.onreadystatechange = function(){
		if (statelessJs.readyState == "loaded" || statelessJs.readyState == "complete") {}
		
		if (document.readyState!='loading'){
			accept()
		} else {
			document.addEventListener("DOMContentLoaded", accept)
		}
	}
	statelessJs.src = "https://unpkg.com/statelessjs"
	statelessJs.setAttribute("async", true)
	statelessJs.setAttribute("defer", true)
	
	document.head.appendChild(statelessJs)
}).then(function(){
	stateless.register(`<div id="wrapper"></div>`)
	stateless.register(
		`<div id="jsonDisplay" class="data-div" onclick="this.scope.minimize(this.scope.property)">
			<div class="starting-brace">{</div>
			<div class="properties"></div>
			<div class="ending-brace">}</div>
		</div>`
	)

	stateless.register(
		`<div id="jsonHidden" class="data-div" onclick="this.scope.show(this.scope.property)">
			<div>{...}</div>
		</div>`
	)

	stateless.register(
		`<div id="otherData" class="data-div">
			<pre></pre>
		</div>`
	)
	
	var createDomJsonRepresentation = function(theJson){
		var jsonBlock = stateless.instantiate("wrapper")
		var displayed = stateless.instantiate("jsonDisplay")
		var hidden = stateless.instantiate("jsonHidden")
		
		jsonBlock.define("data", theJson)
		
		return jsonBlock
	}
	
	var domConsole = inspect = stateless
		.instantiate("wrapper")
		.addClass("console")
		.render()
		.define("log", {
			asVar: function(){
				Array.prototype.forEach.call(arguments, function(item){
					if (typeof item == "object"){
						domConsole.append(createDomJsonRepresentation(item))
					}
				})
				
			}
		})

	
})