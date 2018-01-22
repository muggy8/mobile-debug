	domDebugger.removeChild(domDebugger.console)
	domDebugger.removeChild(domDebugger.inspector)
	domDebugger.removeChild(domDebugger.xhr)

	var navigationDiv = library.clone("wrapper")
	navigationDiv.id = "inspector-navigation"
	domDebugger.appendChild(navigationDiv)

	var consoleTab = library.clone("wrapper")
	consoleTab.innerText = "Console"
	consoleTab.className += " tab-header"
	consoleTab.addEventListener("click", function(){
		if (domDebugger.console.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.console)
			consoleTab.style.backgroundColor = ""
		}
		else {
			domDebugger.appendChild(domDebugger.console)
			consoleTab.style.backgroundColor = "inherit"
		}
	})
	navigationDiv.appendChild(consoleTab)

	var elementsTab = library.clone("wrapper")
	elementsTab.innerText = "Inspector"
	elementsTab.className += " tab-header"
	elementsTab.addEventListener("click", function(){
		if (domDebugger.inspector.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.inspector)
			elementsTab.style.backgroundColor = ""
		}
		else {
			domDebugger.appendChild(domDebugger.inspector)
			elementsTab.style.backgroundColor = "inherit"
		}
	})
	navigationDiv.appendChild(elementsTab)

	var xhrTab = library.clone("wrapper")
	xhrTab.innerText = "XHR"
	xhrTab.className += " tab-header"
	xhrTab.addEventListener("click", function(){
		if (domDebugger.xhr.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.xhr)
			xhrTab.style.backgroundColor = ""
		}
		else {
			domDebugger.appendChild(domDebugger.xhr)
			xhrTab.style.backgroundColor = "inherit"
		}
	})
	navigationDiv.appendChild(xhrTab)

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
		}
	`
