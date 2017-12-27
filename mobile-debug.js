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
		`<div id="jsonDisplay" class="data-div">
			<div class="starting-brace">{</div>
			<div class="properties"></div>
			<div class="ending-brace">}</div>
		</div>`
	)

	stateless.register(
		`<div id="jsonHidden" class="data-div">
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

		var hidden = stateless
			.instantiate("jsonHidden")
			.on("click", function(){
				var keys = Object.keys(theJson)
				var props = Object.getOwnPropertyNames(theJson)

				hidden.unlink()
				jsonBlock.append(shown)

				props.forEach(function(item){

				})
			})

		var shown = stateless
			.instantiate("jsonDisplay")
			.on("click", function(){
				shown.unlink()
				jsonBlock.append(hidden)
			})

		return jsonBlock.append(hidden)
	}

	var createAppropriateRepresentation = function(somedata){
		if (somedata === null){
			return createDomStringRepresentation("null")
		}
		else if (typeof somedata == "object"){
			return createDomJsonRepresentation(somedata)
		}
		else if (typeof somedata == "string"){
			return createDomStringRepresentation(somedata)
		}
		else if (typeof somedata == "function" || typeof somedata == "number"){
			return createDomStringRepresentation(somedata.toString())
		}
		else if (typeof somedata == "boolean"){
			return createDomStringRepresentation(somedata ? "true" : "false")
		}
		else{
			return createDomStringRepresentation("undefined")
		}
	}

	var domConsole = inspect = stateless
		.instantiate("wrapper")
		.addClass("console")
		.render()
		.define("log", {
			asVar: function(){
				Array.prototype.forEach.call(arguments, function(item){
					domConsole.append(createAppropriateRepresentation(item))
				})
			}
		})
		.css("max-height", "3560px")
		.css("overflow", "auto")
		.css("font-family", "monospace")

})
