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
	return Promise.resolve(function(str){
		eval(str)
	})
}).then(function(saferEval){
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
			<div class="json-placeholder">{...}</div>
		</div>`
	)

	stateless.register(
		`<div id="keyVal">
			<div class="key"></div>
			<div class="val"></div>
		</div>`
	)

	stateless.register(
		`<div id="otherData" class="data-div">
			<pre style="margin: 0"></pre>
		</div>`
	)

	var createDomStringRepresentation = function(text){
		return stateless.instantiate("otherData").html("$pre", text)
	}

	var createDomJsonRepresentation = function(theJson){
		var jsonBlock = stateless.instantiate("wrapper")

		var hidden = stateless
			.instantiate("jsonHidden")
			.on("dblclick", function(ev){
				ev.stopPropagation()
				hidden.unlink()
				jsonBlock.append(shown)

				var keys = Object.keys(theJson)
				var props = Object.getOwnPropertyNames(theJson)
				if (shown.children.length > 0 ){
					return
				}

				props.forEach(function(item){
					var keyValDomPair = stateless
						.instantiate("keyVal")
						.html("$ .key", '"' + item + '": ')
						.append("$ .val", createAppropriateRepresentation(theJson[item]))
					shown.appendChild("$ .properties", keyValDomPair)
				})

				var inheritedFrom = Object.getPrototypeOf(theJson)
				if (inheritedFrom){
					shown.appendChild("$ .properties", stateless
						.instantiate("keyVal")
						.html("$ .key", "__proto__")
						.append("$ .val", createAppropriateRepresentation(inheritedFrom))
					)
				}
			})

		var shown = stateless
			.instantiate("jsonDisplay")
			.on("dblclick", function(ev){
				ev.stopPropagation()
				shown.unlink()
				jsonBlock.append(hidden)
			})

		return jsonBlock
			.append(hidden)
			.property("useBrackets", {
				static: function(bracket){
					shown
						.html("$ .starting-brace", bracket[0])
						.html("$ .ending-brace", bracket[1])
					hidden
						.html(
							"$ .json-placeholder",
							hidden.html("$ .json-placeholder")
								.replace("{", bracket[0])
								.replace("}", bracket[1])
						)
				}
			})
	}

	var createAppropriateRepresentation = function(somedata){
		if (somedata === null){
			return createDomStringRepresentation("null")
		}
		else if (typeof somedata == "object" && Array.isArray(somedata)){
			var jsonRep = createDomJsonRepresentation(somedata)
			jsonRep.useBrackets("[]")
			return jsonRep
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
		.attr("id", "mobile-console")
		.appendChild(
			stateless
				.view("<style></style>")
				.html(
					`#mobile-console {
						max-height: 360px;
						overflow: auto;
						font-family: monospace;
					}
					#mobile-console .jsonDisplay .properties {
						margin-left: 1em;
					}
					#mobile-console .jsonDisplay .properties .keyVal {
						display: flex
					}
					#mobile-console .jsonDisplay .properties .keyVal .val {
						flex-grow: 1;
					}
					#mobile-console .jsonHidden {
						cursor: pointer;
					}`
				)
		)
		//.render()
		.define("log", {
			asVar: function(){
				Array.prototype.forEach.call(arguments, function(item){
					domConsole.append(createAppropriateRepresentation(item))
				})
			}
		})
		
		var inputConsole = stateless
			.view(
				`<div>
					<textarea></textarea>
					<button onclick="this.scope.execute()">execute</button>
				</div>`
			)
			.css("width", "100%")
			.define("value", {
				get: function(){
					return inputConsole.element("textarea").value
				},
				set: function(val){
					inputConsole.element("textarea").value = val
				}
			})
			.define("execute", {
				asVar: function(){
					domConsole.log(saferEval(domInputter.value))
					inputConsole.value = ""
				}
			})
			
			var consoleModule = stateless
				.instantiate("wrapper")
				.append(domConsole)
				.append(inputConsole)
				.render()
})
