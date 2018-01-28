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
		var returnNode = qs(templateToElement(templates.otherData),"pre")
		returnNode.innerText = text
		return returnNode
	}

	var createDomJsonRepresentation = function(theJson, props, findProtoFrom){
		var jsonBlock = templateToElement(templates.wrapper)

		var hidden = templateToElement(templates.jsonHidden)
		attachEvent(hidden, doubleClick, function(ev){
			ev.stopPropagation()
			// take the hidden element out and replace it with the snown element instead
			hidden.parentNode ? hidden.parentNode.removeChild(hidden) : false
			append(jsonBlock, shown)

			// if the element that's gonna replace this one already has children then skip the rest cuz the rest of the code generates the children
			if (qs(shown, ".json-properties").children.length > 0){
				return
			}

			// get the object keys and create child elements
			props = props || Object.getOwnPropertyNames(theJson)

			var createSubJsonGroup = function(key, data, props, protoFrom){
				var returnNode = templateToElement(templates.keyVal)
				qs(returnNode, ".pair-key").innerText = '"' + key + '"'
				qs(returnNode, ".pair-key").style.cursor = "pointer"
				var subJsonBlock = createAppropriateRepresentation(data, props, protoFrom)
				append(qs(returnNode, ".pair-val"), subJsonBlock)
				attachEvent(qs(returnNode, ".pair-key"), doubleClick, function(ev){
					ev.stopPropagation()

					var target = qs(subJsonBlock, ".data-div")
					var clickEvent = document.createEvent("MouseEvents")
					clickEvent.initEvent(doubleClick, true, true)
					target && target.dispatchEvent(clickEvent)
				})
				return returnNode
			}
			props.filter(function(item){
				return item !== "__proto__"
			}).forEach(function(item){
				var keyValDomPair = createSubJsonGroup(item, theJson[item])
				append(qs(shown, ".json-properties"), keyValDomPair)
			})

			var inheritedFrom = Object.getPrototypeOf(findProtoFrom || theJson)
			if (inheritedFrom){
				var keyValDomPair = createSubJsonGroup("__proto__" , theJson, Object.getOwnPropertyNames(inheritedFrom), inheritedFrom)
				append(qs(shown, ".json-properties"), keyValDomPair)
			}
		})

		var shown = templateToElement(templates.jsonDisplay)
		attachEvent(shown, doubleClick, function(ev){
			ev.stopPropagation()
			shown.parentNode ? shown.parentNode.removeChild(shown) : false
			append(jsonBlock, hidden)
		})

		append(jsonBlock, hidden)
		jsonBlock.useBrackets = function(bracket){
			qs(shown, ".starting-brace").innerText = bracket[0]
			qs(shown, ".ending-brace").innerText = bracket[1]
			var textContainer = qs(hidden, ".json-placeholder")
			textContainer.innerText = textContainer.innerText
				.replace("{", bracket[0])
				.replace("}", bracket[1])
		}
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
			append(eleView, createDomHtmlRepresentation(somedata))
			append(eleView, createDomJsonRepresentation(somedata, props, protoFrom))
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
				return createDomStringRepresentation('"' + stringReplace(somedata, /\"/g, '\\"') + '"')
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
		}

		#mobile-debug .console-controls:after {
			content: " ";
			display: block;
			clear: both;
		}
		#mobile-debug .console-controls > *{
			float: left;
			width: 33.33%;
			padding: 0.5em;
			text-align: center;
		}`

	var domConsole = templateToElement(templates.wrapper)
	domConsole.id = "mobile-console"

    var domConsoleLog = function(){
		var logBlock = templateToElement(templates.wrapper)
		logBlock.className += " type-log"

		protoForEach(arguments, function(item){
			append(logBlock, createAppropriateRepresentation(item))
		})

		append(domConsole, logBlock)
		domConsole.scrollTop = domConsole.scrollHeight

		return logBlock
	}

	var inputConsole = templateToElement(
		`<div>
			<textarea></textarea>
			<div class="console-controls">
				<button class="exec-btn">Execute</button>
				<button class="clear-input-btn">Clear Input</button>
				<button class="clear-output-btn">Clear Output</button>
			</div>
		</div>`
	)

    var inputTextArea = qs(inputConsole, "textarea")
	inputTextArea.style.width = "100%"

	attachEvent(qs(inputConsole, ".exec-btn"), click, function(){
        systemLog = true // disable quotest around string for this log
        var execInput = inputTextArea.value
        attachEvent(domConsoleLog("Input:\n" + inputTextArea.value), click, function(){
        	inputTextArea.value = execInput
		})
        try {
            domConsoleLog(eval.call(this, execInput))
        }
        catch (o3o){
            systemLog = true
            var logEle = domConsoleLog("Error", o3o).className += " type-err"
        }
        finally {
            inputTextArea.value = ""
        }
    })

    attachEvent(qs(inputConsole, ".clear-input-btn"), click, function(){
    	inputTextArea.value = ""
    })

    attachEvent(qs(inputConsole, ".clear-output-btn"), click, function(){
    	domConsole.innerHTML = ""
    })

	var consoleModule = templateToElement(templates.wrapper)
	append(consoleModule, domConsole)
	append(consoleModule, inputConsole)

	append(domDebugger, domDebugger.console = consoleModule)

	var sourceLog = console.log
	console.log = function(){
		var inputs = protoSlice(arguments)
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
		var inputs = protoSlice(arguments)
		var errors = generateDomLog(inputs)
		domConsoleLog.apply(this, errors).className += " type-err"
		sourceErr.apply(console, inputs)
	}

	var sourceWarn = console.warn
	console.warn = function(){
		var inputs = protoSlice(arguments)
		var errors = generateDomLog(inputs)
		domConsoleLog.apply(this, errors).className += " type-warn"
		sourceWarn.apply(console, inputs)
	}

	attachEvent(window, "error", function(ev){
		domConsoleLog(ev.message + "\nError in file: " + ev.fileName	+ " on line " + ev.lineno + ":" + ev.colno).className += " type-err"
	})
