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

				protoForEach(qs(domView, ".highlight"), function(item){
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

        attachEvent(domPair.keyInput, "keyup", keyValEventHandler)
        attachEvent(domPair.valInput, "keyup", keyValEventHandler)
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
