var inspect
new Promise(function(accept){
	// load dependencies here

	var loadLib = function(url){
		return new Promise(function(accept, reject){
			var script = document.createElement("script")
			script.onload = function(){
				accept()
			}

			script.src = url
			script.setAttribute("async", true)
			script.setAttribute("defer", true)

			document.head.appendChild(script)
		})
	}

	Promise.all([
		loadLib("https://unpkg.com/statelessjs"),
		loadLib("https://cdn.rawgit.com/muggy8/mobile-debug/master/dependencies/cssParser.js")
	]).then(accept)
}).then(function(){
	stateless.register(`<div id="wrapper"></div>`)
	// put a whole container here so we can do some stuff to it later
	var domDebugger = stateless
		.instantiate("wrapper")
		.render()
	var stylesBlock = stateless.view(`<style></style>`)
	domDebugger.append(stylesBlock)
	domDebugger.define("styles", {
		get: function(){
			return stylesBlock.html()
		},
		set: function(val){
			stylesBlock.html(val)
			return val
		}
	})
	return Promise.resolve(domDebugger)
}).then(function(debugContainer){
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

	debugContainer.styles +=
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
	}
	#mobile-console .log,
	#mobile-console .err,
	#mobile-console .warn {
		border-top: solid 1px #DDD;
		padding: 0.25em 0.5em;
	}
	#mobile-console .log {
		color: black;
	}
	#mobile-console .err {
		color: red;
	}
	#mobile-console .warn {
		color: yellow;
	}`
	var domConsole = inspect = stateless
		.instantiate("wrapper")
		.attr("id", "mobile-console")
		.define("log", {
			asVar: function(){
				var logBlock = stateless
					.instantiate("wrapper")
					.addClass("log")
				Array.prototype.forEach.call(arguments, function(item){
					logBlock.append(createAppropriateRepresentation(item))
				})
				domConsole.append(logBlock)
				return logBlock
			}
		})

	var inputConsole = stateless
		.view(
			`<div>
				<textarea></textarea>
				<button onclick="this.scope.execute()">execute</button>
			</div>`
		)
		.css("$ textarea", "width", "100%")
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
				domConsole.log("Input:\n" + inputConsole.value)
				try {
					domConsole.log(eval.call(this, inputConsole.value))
				}
				catch (o3o){
					domConsole.log(o3o).addClass("err")
				}
				finally {
					inputConsole.value = ""
				}
			}
		})

	var consoleModule = stateless
		.instantiate("wrapper")
		.append(domConsole)
		.append(inputConsole)

	debugContainer.append(debugContainer.console = consoleModule)

	var sourceLog = console.log
	console.log = function(){
		var inputs = Array.prototype.slice.call(arguments)
		domConsole.log.apply(this, inputs).addClass("log")
		sourceLog.apply(console, inputs)
	}

	var sourceErr = console.error
	console.error = function(){
		var inputs = Array.prototype.slice.call(arguments)
		var errors = inputs.map(function(item){
			return new Error(item)
		})
		domConsole.log.apply(this, inputs).addClass("err")
		sourceErr.apply(console, inputs)
	}

	var sourceWarn = console.warn
	console.warn = function(){
		var inputs = Array.prototype.slice.call(arguments)
		var errors = inputs.map(function(item){
			return new Error(item)
		})
		sourceWarn.log.apply(this, inputs).addClass("warn")
		sourceErr.apply(console, inputs)
	}

	window.addEventListener("error", function(ev){
		domConsole.log(ev.message + "\nError in file: " + ev.fileName  + " on line " + ev.lineno + ":" + ev.colno).addClass("err")
	})

	return Promise.resolve(consoleModule)
})
