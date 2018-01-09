	library.add(`
		<div id="htmlContainer" class="data-div closed">
			<div class="html-open"></div>
			<div class="html-body"></div>
			<div class="html-close"></div>
		</div>
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
        for (var i = document.styleSheets.length; i > 0; !function(styleSheet){
            var rules = styleSheet.rules || styleSheet.cssRules
            if (!rules){ // the stylesheet api sometimes wont give us styles because of CROS 
                return
            }
            for (var i = rules.length; i > 0; !function(rule){
                if (ele.matches(rule.selectorText)){
                    foundRules.push(rule)
                }
            }(rules[--i]));
        }(document.styleSheets[--i]));
        return foundRules
    }
    var createDomCssRepresentation = function(ele){
        var clone = ele.cloneNode()
        var eleComputeStyles = window.getComputedStyle(ele)
        var cloneComputeStyles = window.getComputedStyle(clone)

        cssRules.forEach(function(rule){

        })

        return ele.style.cssText
    }

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
			padding-left: 1em;
		}
	`

	var domElementInspector = library.clone("wrapper")
	domElementInspector.appendChild(domView)
	domElementInspector.appendChild(cssView)
	domDebugger.appendChild(domElementInspector)
    domElementInspector.appendChild(sizeSlider)
