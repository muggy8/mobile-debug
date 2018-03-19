(function(){
// file src/mobile-debug-foundations.js
	// declare some globals so we can use them later and we can save space in the minified versions
	var append = function(parent, child){
		parent.appendChild(child)
	}
	var attachEvent = function(ele, ev, handler){
		ele.addEventListener(ev, handler)
	}
	var qs = function(ele_selector, selector){
		if (!selector){
			selector = ele_selector
			ele_selector = document
		}
		return ele_selector.querySelector(selector)
	}
	var protoSlice = function(source, start, end){
		return source && Array.prototype.slice.call(source, start, end)
	}
	var protoForEach = function(source, callback){
		return source && Array.prototype.forEach.call(source, callback)
	}
	var protoMap = function(source, callback){
		return source && Array.prototype.map.call(source, callback)
	}
	var protoReduce = function(source, callback, start){
		return source && Array.prototype.reduce.call(source, callback, start)
	}
	var stringReplace = function(str, replaceTarget, replaceWith){
		return str.replace(replaceTarget, replaceWith)
	}
	var click = "click"
	var doubleClick = "dblclick"
	var keyUp = "keyup"

	// moved the main functiosn down so we can use the smaller functiosn for savings
	var converter = document.createElement("div")

    var templates = {}
    var templateToElement = function(string){
        converter.innerHTML = string
        if (converter.children.length){
            return converter.children[0]
        }
    }

    templates.wrapper = `<div class="wrapper"></div>`

	var domDebugger = templateToElement(templates.wrapper)
	domDebugger.id = "mobile-debug"
	var stylesBlock = templateToElement(`<style></style>`)
	append(domDebugger, stylesBlock)

	Object.defineProperty(domDebugger, "styles", {
		enumerable: false,
		configurable: false,
		get: function(){
			return stylesBlock.innerHTML
		},
		set: function(val){
			stylesBlock.innerHTML = val
			return val
		}
	})

	if (document.body){
		append(document.body, domDebugger)
	}
	else {
		document.addEventListener("readystatechange", function(){
			if (document.readyState === "interactive"){
				append(document.body, domDebugger)
			}
		})
	}

	domDebugger.styles += `
		#mobile-debug {
			border-color: #DDD;
			font-family: sans-serif;
		}
		#mobile-debug * {
			border-color: inherit;
            box-sizing: border-box;
		}
		#mobile-debug input,
		#mobile-debug textarea {
			background-color: transparent;
		}
	`

// file src/mobile-debug-console.js
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

// file src/mobile-debug-elements.js
    templates.htmlContainer = `
    <div class="htmlContainer data-div state-closed">
        <div class="html-open"></div>
        <div class="html-body"></div>
        <div class="html-close"></div>
    </div>`

    templates.underlineInput = `<input class="underlineInput" style="border: none; border-bottom: solid 1px #CCC; text-align: center;">`

	var currentHighligher
	var createDomHtmlRepresentation = function(ele){
		if (!ele){
			return
		}

		if (ele instanceof HTMLElement){
			var clone = ele.cloneNode()
			var nodeText = clone.outerHTML
			var nodeRepresentation = templateToElement(templates.htmlContainer)
			var closingTagMatch = nodeText.match(/<\/[^>]+>/)
			var oppeningTag
			if (closingTagMatch){
				var closingTag = closingTagMatch[0]
				oppeningTag = stringReplace(nodeText, closingTag, "")
				qs(nodeRepresentation, ".html-close").innerText = closingTag
				qs(nodeRepresentation, ".html-body").innerText = "..."
			}
			else {
				oppeningTag = nodeText
			}
			var childNodes = ele.childNodes
			qs(nodeRepresentation, ".html-open").innerText = oppeningTag
			if (childNodes.length){
				qs(nodeRepresentation, ".html-body").innerText = "..."
			}

			var show = function(){
				nodeRepresentation.className = stringReplace(nodeRepresentation.className, " state-closed", "") + " state-opened"

				qs(nodeRepresentation, ".html-body").innerHTML = ""
				var appendTarget = qs(nodeRepresentation, ".html-body")
				protoMap(childNodes, function(item){
					return createDomHtmlRepresentation(item)
				}).forEach(function(item){
					append(appendTarget, item)
				})

				nodeRepresentation.dblclickAction = hide
			}
			var hide = function(){
				nodeRepresentation.className = stringReplace(nodeRepresentation.className, " state-opened", "") + " state-closed"
				qs(nodeRepresentation, ".html-body").innerHTML = "..."

				nodeRepresentation.dblclickAction = show
			}

			// it is default hidden show show on double click for default
			nodeRepresentation.dblclickAction = show

			attachEvent(nodeRepresentation, doubleClick, function(ev){
				ev.stopPropagation()
				nodeRepresentation.dblclickAction()
			})

			attachEvent(nodeRepresentation, click, function(ev){
				ev.stopPropagation()

				cssView.innerHTML = ""
				append(cssView, createDomCssRepresentation(ele))

				protoForEach(domView.querySelectorAll(".highlight"), function(item){
					item.className = stringReplace(item.className, " highlight", "")
				})
				nodeRepresentation.className += " highlight"

				currentHighligher && currentHighligher.unlink()
				currentHighligher = highlightBox(ele)
			})

			return nodeRepresentation
		}
		else if (ele instanceof Text){
			systemLog = true;
			return createDomStringRepresentation(ele.nodeValue)
		}

	}

	var highlightBox = function(ele){
		var marginBox = templateToElement(templates.wrapper)
		var borderBox = templateToElement(templates.wrapper)
		var paddingBox = templateToElement(templates.wrapper)

		var eleStyle = window.getComputedStyle(ele)
		var marginStyles = marginBox.style
		var borderStyles = borderBox.style
		var paddingStyles = paddingBox.style
		var elePos = ele.getBoundingClientRect()

		marginStyles.borderStyle = borderStyles.borderStyle = paddingStyles.borderStyle = "solid"
		marginStyles.position = "absolute"
		marginStyles.borderColor = "rgba(252, 160, 50, 0.5)"
		borderStyles.borderColor = "rgba(252, 252, 50, 0.5)"
		paddingStyles.borderColor = "rgba(100, 252, 50, 0.5)"
		paddingStyles.backgroundColor = "rgba(50, 160, 252, 0.5)"
		paddingStyles.boxSizing = borderStyles.boxSizing = "border-box"

		var eleStyles = window.getComputedStyle(ele)

		borderStyles.borderTopWidth = eleStyles.borderTopWidth
		borderStyles.borderBottomWidth = eleStyles.borderBottomWidth
		borderStyles.borderLeftWidth = eleStyles.borderLeftWidth
		borderStyles.borderRightWidth = eleStyles.borderRightWidth
		borderStyles.width = ele.offsetWidth + "px"
		borderStyles.height = ele.offsetHeight + "px"

		paddingStyles.borderTopWidth = eleStyles.paddingTop
		paddingStyles.borderBottomWidth = eleStyles.paddingBottom
		paddingStyles.borderLeftWidth = eleStyles.paddingLeft
		paddingStyles.borderRightWidth = eleStyles.paddingRight
		paddingStyles.width = "100%"
		paddingStyles.height = "100%"

		marginStyles.borderTopWidth = eleStyles.marginTop
		marginStyles.borderBottomWidth = eleStyles.marginBottom
		marginStyles.borderLeftWidth = eleStyles.marginLeft
		marginStyles.borderRightWidth = eleStyles.marginRight

		marginStyles.top = (elePos.top - parseFloat(stringReplace(eleStyles.marginTop, "px", ""))) + "px"
		marginStyles.left = (elePos.left - parseFloat(stringReplace(eleStyles.marginLeft, "px", ""))) + "px"

		append(marginBox, borderBox)
		append(borderBox, paddingBox)

		marginBox.unlink = function(){
			marginBox.parentNode && marginBox.parentNode.removeChild(marginBox)
		}

		marginBox.relink = function(){
			document.body.insertBefore(marginBox, domDebugger)
		}

		attachEvent(marginBox, click, marginBox.unlink)

		marginBox.relink()

		return marginBox
	}

    var getElementCssRules = function(ele){
        ele.matches = ele.matches || ele.webkitMatchesSelector || ele.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector
        var foundRules = []
        // loop over style sheets in reverse order to find relivant style rules
        for (var i = document.styleSheets.length; i > 0; !function(styleSheet){
            try {
                var rules = styleSheet.rules || styleSheet.cssRules
            }
            catch (o3o){ // the stylesheet api sometimes wont give us styles because of CROS
                return
            }
            // loop over stylesheet rules in reverse order to find rules that apply to the element
            for (var i = rules.length; i > 0; !function(rule){
                if (ele.matches(rule.selectorText)){
                    foundRules.push(rule)
                }
            }(rules[--i]));
        }(document.styleSheets[--i]));

		// add to the first array item the "style=" attribute
		foundRules.unshift({
			selectorText: "style attribute",
			style: ele.style
		})

        return foundRules
    }

	var camelCase = function(str){
		return str.replace(/^-/, '').replace(/-([a-z])/g, function (hyphenChar) {
			return hyphenChar[1].toUpperCase()
		})
	}

    var createDomCssKeyValPair = function(rule, ruleIndex, resetView){
        var domPair = templateToElement(templates.keyVal)
        append(qs(domPair, ".pair-key"), domPair.keyInput = templateToElement(templates.underlineInput))
        append(qs(domPair, ".pair-val"), domPair.valInput = templateToElement(templates.underlineInput))
		append(domPair, domPair.deleteButton = templateToElement("<button>X</button>"))

        domPair.keyInput.value = rule.style[ruleIndex] || "New"
        domPair.valInput.value = rule.style.getPropertyValue(rule.style[ruleIndex])
		attachEvent(domPair.deleteButton, click, function(){
			rule.style.removeProperty(rule.style[ruleIndex])
			resetView()
		})

		var keyValEventHandler = function(ev){
			if (
				(ev.key == ":" && ev.target == domPair.keyInput) ||
				(ev.data == ":" && ev.target == domPair.keyInput)
			){
				domPair.valInput.focus()
				domPair.keyInput.value = stringReplace(domPair.keyInput.value, /\:+$/, "")
				ev.stopPropagation()
				ev.preventDefault()
				return
			}

			if (
				!(
					(ev.keyCode === 13 && ev.target === domPair.valInput) ||
					(ev.key === ";" && ev.target === domPair.valInput) ||
					(ev.data === ";" && ev.target === domPair.valInput)
				)
			){
				return
			}
			var styleProp = camelCase(domPair.keyInput.value)
			if (typeof rule.style[styleProp] !== "undefined"){
				rule.style.removeProperty(rule.style[ruleIndex])
				rule.style.setProperty(domPair.keyInput.value, domPair.valInput.value)
				resetView()
			}

            if (typeof rule.style[styleProp] === "undefined" || !rule.style[styleProp]) {
                domPair.className += " type-err"
                domPair.keyInput.style.color = domPair.valInput.style.color = "red"
            }
            else {
                domPair.className = stringReplace(domPair.className, " type-err", "")
                domPair.keyInput.style.color = domPair.valInput.style.color = "black"
            }
        }

        attachEvent(domPair.keyInput, keyUp, keyValEventHandler)
        attachEvent(domPair.valInput, keyUp, keyValEventHandler)
        attachEvent(domPair.keyInput, "input", keyValEventHandler)
        attachEvent(domPair.valInput, "input", keyValEventHandler)

        return domPair
    }

    var createDomCssRuleRepresentation = function(rule, ele){
        var ruleBlock = templateToElement(templates.wrapper)
        append(ruleBlock, createDomStringRepresentation(rule.selectorText))
        var jsonLikeBlock = templateToElement(templates.jsonDisplay)
        append(ruleBlock, jsonLikeBlock)
		var rebuildCssRulesView = function(){
			cssView.innerHTML = ""
			append(cssView, createDomCssRepresentation(ele))
		}
        for(var i = 0; i <= rule.style.length; i++){
            append(qs(jsonLikeBlock, ".json-properties"), createDomCssKeyValPair(rule, i, rebuildCssRulesView))
        }
		return ruleBlock
    }

    var createDomCssRepresentation = function(ele){
        var rules = getElementCssRules(ele)
        var domRuleWrap = templateToElement(templates.wrapper)
        rules.forEach(function(rule){
            append(domRuleWrap, createDomCssRuleRepresentation(rule, ele))
            append(domRuleWrap, document.createElement("hr"))
        })

        return domRuleWrap
    }

	var domView = templateToElement(templates.wrapper)
	domView.id = "dom-view"
	append(domView, createDomHtmlRepresentation(qs(document, "html")))
	var cssView = templateToElement(templates.wrapper)
	cssView.id = "css-view"

    var sizeSlider = templateToElement('<input type="range" min="1" max="99" step="1" style="width: 100%; margin:0;">')
    attachEvent(sizeSlider, "change", function(ev){
        domView.style.width = sizeSlider.value + "%"
        cssView.style.width = (100 - sizeSlider.value) + "%"
    })

	domDebugger.styles += `
		#mobile-debug #dom-view,
		#mobile-debug #css-view {
			border-style: solid;
			border-width: 1px;
			height: 200px;
			overflow: auto;
			font-family: monospace;
            display: inline-block;
            width: 50%;
		}
		#mobile-debug .htmlContainer.state-closed > * {
			display: inline-block;
		}
		#mobile-debug .htmlContainer.state-opened > .html-body {
			margin-left: 1em;
		}
		#mobile-debug .state-opened.highlight > .html-open,
		#mobile-debug .state-opened.highlight > .html-close,
		#mobile-debug .state-closed.highlight {
			background-color: skyblue;
			display: inline;
		}
	`

	var domElementInspector = templateToElement(templates.wrapper)
	append(domElementInspector, domView)
	append(domElementInspector, cssView)
	append(domDebugger, domDebugger.inspector = domElementInspector)
    append(domElementInspector, sizeSlider)

// file src/mobile-debug-xhr.js
	var xhrHistory = {}
	var activeXhrs = []
	var protoXhr = XMLHttpRequest.prototype
	var xhrOpen = protoXhr.open
	var xhrSend = protoXhr.send
	var xhrSetHeader = protoXhr.setRequestHeader

	Object.defineProperty(protoXhr, "open", {
		configurable: true,
		enumerable: false,
		writable: true,
		value: function(){
			var args = protoSlice(arguments)
			var Identifier = args[0] + ":" + args[1]
			var record = xhrHistory[Identifier] = {
				method: args[0],
				url: args[1],
				xhr: this
			}

			if (args[2]){
				record.username = args[3]
			}

			if (args[3]){
				record.password = args[4]
			}

			xhrOpen.apply(this, args)
			activeXhrs.push(record)

			generateXhrListView && generateXhrListView()
		}
	})

	Object.defineProperty(protoXhr, "setRequestHeader", {
		configurable: true,
		enumerable: false,
		writable: true,
		value: function(header, value){
			var currentXhr = this
			var xhrWrapper
			activeXhrs.forEach(function(item){
				if (item.xhr === currentXhr){
					xhrWrapper = item
				}
			})

			if (xhrWrapper){
				xhrWrapper.sentHeaders = xhrWrapper.sentHeaders || {}
				xhrWrapper.sentHeaders[header] = value
			}

			xhrSetHeader.call(xhrWrapper.xhr, header, value)
		}
	})

	Object.defineProperty(protoXhr, "send", {
		configurable: true,
		enumerable: false,
		writable: true,
		value: function(body){
			var currentXhr = this
			var activeIndex
			activeXhrs.forEach(function(item, index){
				if (item.xhr === currentXhr){
					activeIndex = index
				}
			})

			var xhrWrapper = activeXhrs[activeIndex]
			activeXhrs.splice(activeIndex, 1)


			if (typeof body === "undefined"){
				xhrSend.call(currentXhr)
			}
			else {
				xhrSend.call(currentXhr, body)
				xhrWrapper.body = body
			}

			attachEvent(currentXhr, "loadend", function(){
				xhrWrapper.responce = currentXhr.responseText
				xhrWrapper.status = currentXhr.status
				xhrWrapper.recievedHeaders = {}
				currentXhr.getAllResponseHeaders().split("\n").forEach(function(row){
					var headerSplit = row.split(": ")
					if (headerSplit[0]){
						xhrWrapper.recievedHeaders[headerSplit[0]] = headerSplit[1]
					}
				})

			})
		}
	})

	var xhrModule = templateToElement(templates.wrapper)
	var xhrList = templateToElement(templates.wrapper)
	xhrList.id = "xhrList"
	xhrDetails = templateToElement(templates.wrapper)
	xhrDetails.id = "xhrDetails"
	append(xhrModule, xhrList)
	append(xhrModule, xhrDetails)

	append(domDebugger, domDebugger.xhr = xhrModule)

	domDebugger.styles += `
		#mobile-debug .xhr-list-item {
			padding: 0.5em;
			border-bottom: 1px solid #CCC;
		}
		#mobile-debug #xhrList,
		#mobile-debug #xhrDetails {
			border: solid 1px #CCC;
			height: 150px;
			overflow: auto;
		}
	`

	var generateXhrListView = function(){
		// clear all children first
		protoForEach(xhrList.children, function(item){
			xhrList.removeChild(item)
		})

		for (var request in xhrHistory){
			void function(label, xhrWrapper){
				var xhrItem = createDomStringRepresentation(label)
				attachEvent(xhrItem, click, function(){
					createXhrDetailedView(xhrWrapper)
				})

				append(xhrList, xhrItem)
				xhrItem.className += " xhr-list-item"
			}(request, xhrHistory[request])
		}
	}

	var createXhrDetailedView = function(xhrWrapper){
		var removalItem
		while(removalItem = xhrDetails.children[0]){
			xhrDetails.removeChild(removalItem)
		}


		var resultsView = createDomStringRepresentation(xhrWrapper.responce)

		// build the stats view objects to display the information
		var xhrStatsView = []
		xhrStatsView.push(createDomStringRepresentation("General"))
		xhrStatsView.push(createDomJsonRepresentation({
			method: xhrWrapper.method,
			url: xhrWrapper.url,
			status: xhrWrapper.status
		}))

		if (xhrWrapper.recievedHeaders){
			xhrStatsView.push(document.createElement("hr"))
			xhrStatsView.push(createDomStringRepresentation("Recieved Headers"))
			xhrStatsView.push(createDomJsonRepresentation(xhrWrapper.recievedHeaders))
		}

		if (xhrWrapper.sentHeaders){
			xhrStatsView.push(document.createElement("hr"))
			xhrStatsView.push(createDomStringRepresentation("Sent Headers"))
			xhrStatsView.push(createDomJsonRepresentation(xhrWrapper.sentHeaders))
		}

		if (xhrWrapper.body){
			xhrStatsView.push(document.createElement("hr"))
			xhrStatsView.push(createDomStringRepresentation("Payload"))
			systemLog = true
			xhrStatsView.push(createAppropriateRepresentation(xhrWrapper.body))
			systemLog = false
		}

		// responce view toggle button
		var responceButton = document.createElement("button")
		responceButton.innerText = "Responce"
		attachEvent(responceButton, click, function(){
			xhrStatsView.forEach(function(item){
				item.parentNode == xhrDetails && xhrDetails.removeChild(item)
			})
			append(xhrDetails, resultsView)
		})

		// stats view toggle button
		var statsButton = document.createElement("button")
		statsButton.innerText = "Stats"
		attachEvent(statsButton, click, function(){
			resultsView.parentNode == xhrDetails && xhrDetails.removeChild(resultsView)
			xhrStatsView.forEach(function(item){
				append(xhrDetails, item)
			})
		})

		// append default view to the right div
		append(xhrDetails, responceButton)
		append(xhrDetails, statsButton)
		append(xhrDetails, resultsView)
	}

// file src/mobile-debug-manager.js
	domDebugger.removeChild(domDebugger.console)
	domDebugger.removeChild(domDebugger.inspector)
	domDebugger.removeChild(domDebugger.xhr)

	var calculateBodyExtention = function(){
		document.body.style.removeProperty("padding-bottom")
		var bodyStyles = window.getComputedStyle(document.body)
		var currentBodyPaddingBot = parseFloat(stringReplace(bodyStyles.paddingBottom, "px", ""))

		var debuggerStyles = window.getComputedStyle(domDebugger)
		var currentDebuggerHeight = parseFloat(stringReplace(debuggerStyles.height, "px", ""))

		document.body.style.setProperty("padding-bottom", (currentBodyPaddingBot + currentDebuggerHeight) + "px", "important")
	}

	var navigationDiv = templateToElement(templates.wrapper)
	navigationDiv.id = "inspector-navigation"
	append(domDebugger, navigationDiv)

	var closeConsole = function(){
		if (domDebugger.console.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.console)
			consoleTab.style.backgroundColor = ""
			return true
		}
		return false
	}

	var consoleTab = templateToElement(templates.wrapper)
	consoleTab.innerText = "Console"
	consoleTab.className += " tab-header"
	attachEvent(consoleTab, click, function(){
		closeXhr()
		closeElements()
		if (!closeConsole()) {
			append(domDebugger, domDebugger.console)
			consoleTab.style.backgroundColor = "inherit"
		}
		calculateBodyExtention()
	})
	append(navigationDiv, consoleTab)

	var closeElements = function(){
		if (domDebugger.inspector.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.inspector)
			elementsTab.style.backgroundColor = ""
			return true
		}
		return false
	}

	var elementsTab = templateToElement(templates.wrapper)
	elementsTab.innerText = "Inspector"
	elementsTab.className += " tab-header"
	attachEvent(elementsTab, click, function(){
		closeXhr()
		closeConsole()
		if (!closeElements()){
			append(domDebugger, domDebugger.inspector)
			elementsTab.style.backgroundColor = "inherit"
		}
		calculateBodyExtention()
	})
	append(navigationDiv, elementsTab)

	var closeXhr = function(){
		if (domDebugger.xhr.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.xhr)
			xhrTab.style.backgroundColor = ""
			return true
		}
		return false
	}

	var xhrTab = templateToElement(templates.wrapper)
	xhrTab.innerText = "XHR"
	xhrTab.className += " tab-header"
	attachEvent(xhrTab, click, function(){
		closeConsole()
		closeElements()
		if (!closeXhr()){
			append(domDebugger, domDebugger.xhr)
			xhrTab.style.backgroundColor = "inherit"
		}
		calculateBodyExtention()
	})
	append(navigationDiv, xhrTab)

	domDebugger.styles += `
		#mobile-debug .tab-header {
			display: inline-block;
			width: 33.33%;
			padding: 0.5em;
			text-align: center;
			background-color: #FFF;
		}

		#mobile-debug {
			background-color: #EEEEEE;
			padding: 0.25em;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
		}
	`
	if (document.readyState === "complete"){
		append(document.body, domDebugger)
	}
	attachEvent(document, "readystatechange", function(){
		if (document.readyState === "complete"){
			calculateBodyExtention()
		}
	})

    var debuggerConfig = document.currentScript.innerHTML
    if (debuggerConfig){
        var debuggerConfig = JSON.parse(debuggerConfig)
    	for(var key in debuggerConfig.style){
    		domDebugger.style[key] = debuggerConfig.style[key]
    	}
    }
})()