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
		`<div id="jsonDisplay" class="data-div" onclick="this.scope.hide()">
			<div class="starting-brace">{</div>
			<div class="properties"></div>
			<div class="ending-brace">}</div>
		</div>`
	)

	stateless.register(
		`<div id="jsonHidden" class="data-div" onclick="this.scope.show()">
			<div>{...}</div>
		</div>`
	)

	stateless.register(
		`<div id="otherData" class="data-div">
			<pre></pre>
		</div>`
	)

	var createDomStringRepresentation = function(text){
		return stateless.instantiate("otherData").html("$pre", text)
	}

	var createDomJsonRepresentation = function(theJson){
		var jsonBlock = stateless.instantiate("wrapper")
		var hidden = stateless.instantiate("jsonHidden")

		jsonBlock
			.define("data", theJson)
			.define("show", function(){
				var keys = Object.keys(theJson)
				var props = Object.getOwnPropertyNames(theJson)

				props.sort
			})

		return jsonBlock.append(hidden)
	}

	var domConsole = inspect = stateless
		.instantiate("wrapper")
		.addClass("console")
		.render()
		.define("log", {
			asVar: function(){
				Array.prototype.forEach.call(arguments, function(item){
					if (item === null){
						domConsole.append(createDomStringRepresentation("null"))
					}
					else if (typeof item == "object"){
						domConsole.append(createDomJsonRepresentation(item))
					}
					else if (typeof item == "string"){
						domConsole.append(createDomStringRepresentation(item))
					}
					else if (typeof item == "function" || typeof item == "number"){
						domConsole.append(createDomStringRepresentation(item.toString()))
					}
					else if (typeof item == "boolean"){
						domConsole.append(createDomStringRepresentation(item ? "true" : "false"))
					}
					else if (typeof item == "undefined"){
						domConsole.append(createDomStringRepresentation("undefined"))
					}
				})

			}
		})
		.css("max-height", "3560px")
		.css("scroll", "auto")

})
