	library.add(`
		<div id="htmlContainer" class="data-div closed">
			<div class="html-open"></div>
			<div class="html-body"></div>
			<div class="html-close"></div>
		</div>
        <input id="underlineInput" style="border: none; border-bottom: solid 1px #CCC; text-align: center;">
	`)

	var createDomHtmlRepresentation = function(ele){
		if (!ele){
			return
		}

		if (ele instanceof HTMLElement){
			var clone = ele.cloneNode()
			var nodeText = clone.outerHTML
			var nodeRepresentation = library.clone("htmlContainer")
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
				nodeRepresentation.className = nodeRepresentation.className.replace(" closed", "") + " open"

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
				nodeRepresentation.className = nodeRepresentation.className.replace(" open", "") + " closed"
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

			})

			return nodeRepresentation

			// debug and testing returns
			return {
				close: closingTag,
				contents: ele.innerHTML,
				open: oppeningTag
			}
		}
		else if (ele instanceof Text){
			systemLog = true;
			return createDomStringRepresentation(ele.nodeValue)
		}

	}

    var getElementCssRules = function(ele){
        ele.matches = ele.matches || ele.webkitMatchesSelector || ele.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector
        var foundRules = []
        // loop over style sheets in reverse order
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
        return foundRules
    }

    var createDomCssKeyValPair = function(rule, ruleIndex){
        var domPair = library.clone("keyVal")
        domPair.querySelector(".key").appendChild(domPair.keyInput = library.clone("underlineInput"))
        domPair.querySelector(".val").appendChild(domPair.valInput = library.clone("underlineInput"))

        domPair.keyInput.value = rule.style[ruleIndex]
        domPair.valInput.value = rule.style.getPropertyValue(rule.style[ruleIndex])

        domPair.keyInput.addEventListener("keyup", function(){
            rule.style.removeProperty(rule.style[ruleIndex])
            rule.style[ruleIndex] = domPair.keyInput.value
            rule.style.setProperty(rule.style[ruleIndex], domPair.valInput.value)

            if (rule.style.getPropertyValue(rule.style[ruleIndex]) !== domPair.valInput.value && !domPair.className.match(/\serr\s?/)) {
                domPair.className += " err"
                domPair.keyInput.style.color = domPair.valInput.style.color = "red"
            }
            else {
                domPair.className = domPair.className.replace(" err", "")
                domPair.keyInput.style.color = domPair.valInput.style.color = "black"
            }
        })

        domPair.valInput.addEventListener("keyup", function(){
            rule.style.setProperty(rule.style[ruleIndex], domPair.valInput.value)
        })
        return domPair
    }

    var createDomCssRuleRepresentation = function(rule){
        var ruleBlock = library.clone("wrapper")
        ruleBlock.appendChild(createDomStringRepresentation(rule.selectorText))
        var jsonLikeBlock = library.clone("jsonDisplay")
        ruleBlock.appendChild(jsonLikeBlock)
        for(var i = 0; i < rule.style.length; i++){
            jsonLikeBlock.querySelector(".properties").appendChild(createDomCssKeyValPair(rule, i))
        }
        return ruleBlock
    }

    var createDomCssRepresentation = function(ele){
        var rules = getElementCssRules(ele)
        var domRuleWrap = library.clone("wrapper")
        rules.forEach(function(rule){
            domRuleWrap.appendChild(createDomCssRuleRepresentation(rule))
            domRuleWrap.appendChild(document.createElement("hr"))
        })

        return domRuleWrap
    }

    // to test
    // document.querySelector("#css-view").appendChild(createDomCssRepresentation(document.querySelector(".data-div")))

	var domView = library.clone("wrapper")
	domView.id = "dom-view"
	domView.appendChild(createDomHtmlRepresentation(document.querySelector("html")))
	var cssView = library.clone("wrapper")
	cssView.id = "css-view"

    var sizeSlider = library.convert('<input type="range" min="0" max="100" step="1" style="width: 100%; margin:0;">')
    sizeSlider.addEventListener("change", function(ev){
        domView.style.width = sizeSlider.value + "%"
        cssView.style.width = (100 - sizeSlider.value) + "%"
    })

	domDebugger.styles += `
		#mobile-debug #dom-view,
		#mobile-debug #css-view {
			border-style: solid;
			border-width: 1px;
			height: 360px;
			overflow: auto;
			font-family: monospace;
            display: inline-block;
            width: 50%;
		}
		#mobile-debug .htmlContainer.closed > * {
			display: inline-block;
		}
		#mobile-debug .htmlContainer.open > .html-body {
			margin-left: 1em;
		}
		#mobile-debug .open.highlight > .html-open,
		#mobile-debug .open.highlight > .html-close,
		#mobile-debug .closed.highlight {
			background-color: skyblue;
		}
	`

	var domElementInspector = library.clone("wrapper")
	domElementInspector.appendChild(domView)
	domElementInspector.appendChild(cssView)
	domDebugger.appendChild(domElementInspector)
    domElementInspector.appendChild(sizeSlider)
