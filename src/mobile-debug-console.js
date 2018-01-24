    templates.jsonDisplay = `
    <div class="jsonDisplay data-div">
        <div class="starting-brace">{</div>
        <div class="json-properties"></div>
        <div class="ending-brace">}</div>
    </div>`

    templates.jsonHidden = `
    <div class="jsonHidden data-div">
        <div class="json-placeholder">{...}</div>
    </div>`

    templates.keyVal = `
    <div class="keyVal">
        <div class="pair-key"></div>:
        <div class="pair-val"></div>
    </div>`

    templates.otherData = `
    <div class="otherData data-div">
        <pre style="margin: 0"></pre>
    </div>`

	var createDomStringRepresentation = function(text){
		var returnNode = templateToElement(templates.otherData).querySelector("pre")
		returnNode.innerText = text
		return returnNode
	}

	var createDomJsonRepresentation = function(theJson, props, findProtoFrom){
		var jsonBlock = templateToElement(templates.wrapper)

		var hidden = templateToElement(templates.jsonHidden)
		hidden.addEventListener("dblclick", function(ev){
			ev.stopPropagation()
			// take the hidden element out and replace it with the snown element instead
			hidden.parentNode ? hidden.parentNode.removeChild(hidden) : false
			jsonBlock.appendChild(shown)

			// if the element that's gonna replace this one already has children then skip the rest cuz the rest of the code generates the children
			if (shown.querySelector(".json-properties").children.length > 0){
				return
			}

			// get the object keys and create child elements
			props = props || Object.getOwnPropertyNames(theJson)

			var createSubJsonGroup = function(key, data, props, protoFrom){
				var returnNode = templateToElement(templates.keyVal)
				returnNode.querySelector(".key").innerText = '"' + key + '"'
				returnNode.querySelector(".key").style.cursor = "pointer"
				var subJsonBlock = createAppropriateRepresentation(data, props, protoFrom)
				returnNode.querySelector(".val").appendChild(subJsonBlock)
				returnNode.querySelector(".key").addEventListener("dblclick", function(ev){
					ev.stopPropagation()

					var target = subJsonBlock.querySelector(".data-div")
					var clickEvent = document.createEvent("MouseEvents")
					clickEvent.initEvent("dblclick", true, true)
					target && target.dispatchEvent(clickEvent)
				})
				return returnNode
			}
			props.filter(function(item){
				return item !== "__proto__"
			}).forEach(function(item){
				var keyValDomPair = createSubJsonGroup(item, theJson[item])
				shown.querySelector(".json-properties").appendChild(keyValDomPair)
			})

			var inheritedFrom = Object.getPrototypeOf(findProtoFrom || theJson)
			if (inheritedFrom){
				var keyValDomPair = createSubJsonGroup("__proto__" , theJson, Object.getOwnPropertyNames(inheritedFrom), inheritedFrom)
				shown.querySelector(".json-properties").appendChild(keyValDomPair)
			}
		})

		var shown = templateToElement(templates.jsonDisplay)
		shown.addEventListener("dblclick", function(ev){
			ev.stopPropagation()
			shown.parentNode ? shown.parentNode.removeChild(shown) : false
			jsonBlock.appendChild(hidden)
		})

		jsonBlock.appendChild(hidden)
		Object.defineProperty(jsonBlock, "useBrackets", {
			enumerable: true,
			configurable: true,
			writable: false,
			value: function(bracket){
				shown.querySelector(".starting-brace").innerText = bracket[0]
				shown.querySelector(".ending-brace").innerText = bracket[1]
				var textContainer = hidden.querySelector(".json-placeholder")
				textContainer.innerText = textContainer.innerText
					.replace("{", bracket[0])
					.replace("}", bracket[1])
			}
		})
		return jsonBlock
	}

	var systemLog = false
	var createAppropriateRepresentation = function(somedata, props, protoFrom){
		if (somedata === null){
			return createDomStringRepresentation("null")
		}
		else if (typeof somedata == "object" && Array.isArray(somedata)){
			var jsonRep = createDomJsonRepresentation(somedata, props, protoFrom)
			jsonRep.useBrackets("[]")
			return jsonRep
		}
		else if (somedata instanceof HTMLElement){
			var eleView = templateToElement(templates.wrapper)
			eleView.appendChild(createDomHtmlRepresentation(somedata))
			eleView.appendChild(createDomJsonRepresentation(somedata, props, protoFrom))
			return eleView
		}
		else if (typeof somedata == "object"){
			return createDomJsonRepresentation(somedata, props, protoFrom)
		}
		else if (typeof somedata == "string"){
			if (systemLog){
				systemLog = false
				return createDomStringRepresentation(somedata)
			}
			else {
				return createDomStringRepresentation('"' + somedata.replace(/\"/g, '\\"') + '"')
			}
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

	// alright we are done declaring the passive functions and now we're ready to use them

	domDebugger.styles +=
		`#mobile-debug #mobile-console {
			border-style: solid;
			border-width: 1px;
			height: 200px;
			overflow: auto;
			font-family: monospace;
		}
		#mobile-debug .jsonDisplay .json-properties {
			margin-left: 1em;
		}
		#mobile-debug .jsonDisplay .json-properties .keyVal {
			display: flex
		}
		#mobile-debug .jsonDisplay .json-properties .keyVal .pair-val {
			flex-grow: 1;
		}
		#mobile-debug .jsonHidden {
			cursor: pointer;
		}
		#mobile-debug .type-log,
		#mobile-debug .type-err,
		#mobile-debug .type-warn {
			border-top: solid 1px #DDD;
			padding: 0.25em 0.5em;
		}
		#mobile-debug .type-log {
			color: Black;
		}
		#mobile-debug .type-err {
			color: Red;
		}
		#mobile-debug .type-warn {
			color: GoldenRod;
		}
		#mobile-debug .data-div {
			cursor: pointer;
            white-space: nowrap;
		}`

	var domConsole = templateToElement(templates.wrapper)
	domConsole.id = "mobile-console"

    var domConsoleLog = function(){
		var logBlock = templateToElement(templates.wrapper)
		logBlock.className += " type-log"

		Array.prototype.forEach.call(arguments, function(item){
			logBlock.appendChild(createAppropriateRepresentation(item))
		})

		domConsole.appendChild(logBlock)
		domConsole.scrollTop = domConsole.scrollHeight

		return logBlock
	}

	var inputConsole = templateToElement(
		`<div>
			<textarea></textarea>
			<button>execute</button>
		</div>`
	)

    var inputTextArea = inputConsole.querySelector("textarea")
	inputTextArea.style.width = "100%"

	// Object.defineProperty(inputConsole, "value", {
	// 	enumerable: true,
	// 	configurable: true,
	// 	get: function(){
	// 		return inputConsole.querySelector("textarea").value
	// 	},
	// 	set: function(val){
	// 		inputConsole.querySelector("textarea").value = val
	// 		return val
	// 	}
	// })
    //
	// Object.defineProperty(inputConsole, "execute", {
	// 	enumerable: true,
	// 	configurable: true,
	// 	writable: true,
	// 	value: function(){
	// 		systemLog = true // disable quotest around string for this log
	// 		domConsoleLog("Input:\n" + inputConsole.value)
	// 		try {
	// 			domConsoleLog(eval.call(this, inputConsole.value))
	// 		}
	// 		catch (o3o){
	// 			systemLog = true
	// 			var logEle = domConsoleLog("Error", o3o).className += " type-err"
	// 		}
	// 		finally {
	// 			inputConsole.value = ""
	// 		}
	// 	}
	// })

	inputConsole.querySelector("button").addEventListener("click", function(){
        systemLog = true // disable quotest around string for this log
        domConsoleLog("Input:\n" + inputTextArea.value)
        try {
            domConsoleLog(eval.call(this, inputTextArea.value))
        }
        catch (o3o){
            systemLog = true
            var logEle = domConsoleLog("Error", o3o).className += " type-err"
        }
        finally {
            inputTextArea.value = ""
        }
    })

	var consoleModule = templateToElement(templates.wrapper)
	consoleModule.appendChild(domConsole)
	consoleModule.appendChild(inputConsole)

	domDebugger.appendChild(domDebugger.console = consoleModule)

	var sourceLog = console.log
	console.log = function(){
		var inputs = Array.prototype.slice.call(arguments)
		domConsoleLog.apply(this, inputs).className += " type-log"
		sourceLog.apply(console, inputs)
	}

	var generateDomLog = function(inputs){
		return inputs.reduce(function(currentLogs, item){
			currentLogs.push(item)
			currentLogs.push(new Error(item))
			return currentLogs
		}, [])
	}

	var sourceErr = console.error
	console.error = function(){
		var inputs = Array.prototype.slice.call(arguments)
		var errors = generateDomLog(inputs)
		domConsoleLog.apply(this, errors).className += " type-err"
		sourceErr.apply(console, inputs)
	}

	var sourceWarn = console.warn
	console.warn = function(){
		var inputs = Array.prototype.slice.call(arguments)
		var errors = generateDomLog(inputs)
		domConsoleLog.apply(this, errors).className += " type-warn"
		sourceWarn.apply(console, inputs)
	}

	window.addEventListener("error", function(ev){
		domConsoleLog(ev.message + "\nError in file: " + ev.fileName	+ " on line " + ev.lineno + ":" + ev.colno).className += " type-err"
	})
