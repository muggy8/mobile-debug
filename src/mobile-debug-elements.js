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
				oppeningTag = nodeText.replace(closingTag, "")
				nodeRepresentation.querySelector(".html-close").innerText = closingTag
				nodeRepresentation.querySelector(".html-body").innerText = "..."
			}
			else {
				oppeningTag = nodeText
			}
			var childNodes = ele.childNodes
			nodeRepresentation.querySelector(".html-open").innerText = oppeningTag
			if (childNodes.length){
				nodeRepresentation.querySelector(".html-body").innerText = "..."
			}

			var show = function(){
				nodeRepresentation.className = nodeRepresentation.className.replace(" state-closed", "") + " state-opened"

				nodeRepresentation.querySelector(".html-body").innerHTML = ""
				var appendTarget = nodeRepresentation.querySelector(".html-body")
				Array.prototype.map.call(childNodes, function(item){
					return createDomHtmlRepresentation(item)
				}).forEach(function(item){
					appendTarget.appendChild(item)
				})

				nodeRepresentation.dblclickAction = hide
			}
			var hide = function(){
				nodeRepresentation.className = nodeRepresentation.className.replace(" state-opened", "") + " state-closed"
				nodeRepresentation.querySelector(".html-body").innerHTML = "..."

				nodeRepresentation.dblclickAction = show
			}

			// it is default hidden show show on double click for default
			nodeRepresentation.dblclickAction = show

			nodeRepresentation.addEventListener("dblclick", function(ev){
				ev.stopPropagation()
				nodeRepresentation.dblclickAction()
			})

			nodeRepresentation.addEventListener("click", function(ev){
				ev.stopPropagation()

				cssView.innerHTML = ""
				cssView.appendChild(createDomCssRepresentation(ele))

				Array.prototype.forEach.call(domView.querySelectorAll(".highlight"), function(item){
					item.className = item.className.replace(" highlight", "")
				})
				nodeRepresentation.className += " highlight"

				currentHighligher && currentHighligher.parentNode.removeChild(currentHighligher)
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

		var constraints = templateToElement(templates.wrapper)

		var eleStyle = window.getComputedStyle(ele)

		var constraintsStyles = constraints.style
		var marginStyles = marginBox.style
		var borderStyles = borderBox.style
		var paddingStyles = paddingBox.style

		constraintsStyles.width = eleStyle.width
		constraintsStyles.height = eleStyle.height
		constraints.position = "relitive"

		marginStyles.borderStyle = borderStyles.borderStyle = paddingStyles.borderStyle = "solid"
		marginStyles.position = "absolute"
		marginStyles.borderColor = "rgba(252, 160, 50, 0.5)"
		borderStyles.borderColor = "rgba(252, 252, 50, 0.5)"
		paddingStyles.borderColor = "rgba(100, 252, 50, 0.5)"
		paddingStyles.backgroundColor = "rgba(50, 160, 252, 0.5)"

		var eleStyles = window.getComputedStyle(ele)

		borderStyles.borderTopWidth = eleStyles.borderTopWidth
		borderStyles.borderBottomWidth = eleStyles.borderBottomWidth
		borderStyles.borderLeftWidth = eleStyles.borderLeftWidth
		borderStyles.borderRightWidth = eleStyles.borderRightWidth
		borderStyles.position = "relitive"

		paddingStyles.borderTopWidth = eleStyles.paddingTop
		paddingStyles.borderBottomWidth = eleStyles.paddingBottom
		paddingStyles.borderLeftWidth = eleStyles.paddingLeft
		paddingStyles.borderRightWidth = eleStyles.paddingRight
		paddingStyles.position = "absolute"
		paddingStyles.width = paddingStyles.height = "100%"

		marginStyles.borderTopWidth = eleStyles.marginTop
		marginStyles.borderBottomWidth = eleStyles.marginBottom
		marginStyles.borderLeftWidth = eleStyles.marginLeft
		marginStyles.borderRightWidth = eleStyles.marginRight

		if (eleStyle.boxSizing == "border-box") {
			constraints.appendChild(borderBox)
			borderBox.appendChild(paddingBox)
			marginBox.appendChild(constraints)
		}
		else {
			constraints.appendChild(paddingBox)
			borderBox.appendChild(constraints)
			marginBox.appendChild(borderBox)
		}

		document.body.insertBefore(marginBox, domDebugger)
		marginBox.appendChild(borderBox)
		borderBox.appendChild(paddingBox)

		return marginBox
	}

    var getElementCssRules = function(ele){
        ele.matches = ele.matches || ele.webkitMatchesSelector || ele.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector
        var foundRules = []
        // loop over style sheets in reverse order to find relivant style rules
        for (var i = document.styleSheets.length; i > 0; !function(styleSheet){
            var rules = styleSheet.rules || styleSheet.cssRules
            if (!rules){ // the stylesheet api sometimes wont give us styles because of CROS
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
        domPair.querySelector(".pair-key").appendChild(domPair.keyInput = templateToElement(templates.underlineInput))
        domPair.querySelector(".pair-val").appendChild(domPair.valInput = templateToElement(templates.underlineInput))
		domPair.appendChild(domPair.deleteButton = templateToElement("<button>X</button>"))

        domPair.keyInput.value = rule.style[ruleIndex] || "New"
        domPair.valInput.value = rule.style.getPropertyValue(rule.style[ruleIndex])
		domPair.deleteButton.addEventListener("click", function(){
			rule.style.removeProperty(rule.style[ruleIndex])
			resetView()
		})

		var keyValEventHandler = function(ev){
			if (
				(ev.key == ":" && ev.target == domPair.keyInput) ||
				(ev.data == ":" && ev.target == domPair.keyInput)
			){
				domPair.valInput.focus()
				domPair.keyInput.value = domPair.keyInput.value.replace(/\:+$/, "")
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
                domPair.className = domPair.className.replace(" type-err", "")
                domPair.keyInput.style.color = domPair.valInput.style.color = "black"
            }
        }

        domPair.keyInput.addEventListener("keyup", keyValEventHandler)
        domPair.valInput.addEventListener("keyup", keyValEventHandler)
        domPair.keyInput.addEventListener("input", keyValEventHandler)
        domPair.valInput.addEventListener("input", keyValEventHandler)

        return domPair
    }

    var createDomCssRuleRepresentation = function(rule, ele){
        var ruleBlock = templateToElement(templates.wrapper)
        ruleBlock.appendChild(createDomStringRepresentation(rule.selectorText))
        var jsonLikeBlock = templateToElement(templates.jsonDisplay)
        ruleBlock.appendChild(jsonLikeBlock)
		var rebuildCssRulesView = function(){
			cssView.innerHTML = ""
			cssView.appendChild(createDomCssRepresentation(ele))
		}
        for(var i = 0; i <= rule.style.length; i++){
            jsonLikeBlock.querySelector(".json-properties").appendChild(createDomCssKeyValPair(rule, i, rebuildCssRulesView))
        }
		return ruleBlock
    }

    var createDomCssRepresentation = function(ele){
        var rules = getElementCssRules(ele)
        var domRuleWrap = templateToElement(templates.wrapper)
        rules.forEach(function(rule){
            domRuleWrap.appendChild(createDomCssRuleRepresentation(rule, ele))
            domRuleWrap.appendChild(document.createElement("hr"))
        })

        return domRuleWrap
    }

    // to test
    // document.querySelector("#css-view").appendChild(createDomCssRepresentation(document.querySelector(".data-div")))

	var domView = templateToElement(templates.wrapper)
	domView.id = "dom-view"
	domView.appendChild(createDomHtmlRepresentation(document.querySelector("html")))
	var cssView = templateToElement(templates.wrapper)
	cssView.id = "css-view"

    var sizeSlider = templateToElement('<input type="range" min="1" max="99" step="1" style="width: 100%; margin:0;">')
    sizeSlider.addEventListener("change", function(ev){
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
	domElementInspector.appendChild(domView)
	domElementInspector.appendChild(cssView)
	domDebugger.appendChild(domDebugger.inspector = domElementInspector)
    domElementInspector.appendChild(sizeSlider)
