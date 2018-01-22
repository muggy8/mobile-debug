	domDebugger.removeChild(domDebugger.console)
	domDebugger.removeChild(domDebugger.inspector)
	domDebugger.removeChild(domDebugger.xhr)

	var calculateBodyExtention = function(){
		document.body.style.removeProperty("padding-bottom")
		var bodyStyles = window.getComputedStyle(document.body)
		var currentBodyPaddingBot = parseFloat((bodyStyles.paddingBottom).replace("px", ""))

		var debuggerStyles = window.getComputedStyle(domDebugger)
		var currentDebuggerHeight = parseFloat((debuggerStyles.height).replace("px", ""))

		document.body.style.setProperty("padding-bottom", (currentBodyPaddingBot + currentDebuggerHeight) + "px", "important")
	}

	var navigationDiv = library.clone("wrapper")
	navigationDiv.id = "inspector-navigation"
	domDebugger.appendChild(navigationDiv)
	
	var closeConsole = function(){
		if (domDebugger.console.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.console)
			consoleTab.style.backgroundColor = ""
			return true
		}
		return false
	}

	var consoleTab = library.clone("wrapper")
	consoleTab.innerText = "Console"
	consoleTab.className += " tab-header"
	consoleTab.addEventListener("click", function(){
		
		if (!closeConsole()) {
			domDebugger.appendChild(domDebugger.console)
			consoleTab.style.backgroundColor = "inherit"
		}
		calculateBodyExtention()
	})
	navigationDiv.appendChild(consoleTab)
	
	var closeElements = function(){
		if (domDebugger.inspector.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.inspector)
			elementsTab.style.backgroundColor = ""
			return true
		}
		return false
	}

	var elementsTab = library.clone("wrapper")
	elementsTab.innerText = "Inspector"
	elementsTab.className += " tab-header"
	elementsTab.addEventListener("click", function(){
		if (!closeElements()){
			domDebugger.appendChild(domDebugger.inspector)
			elementsTab.style.backgroundColor = "inherit"
		}
		calculateBodyExtention()
	})
	navigationDiv.appendChild(elementsTab)
	
	var closeXhr = function(){
		if (domDebugger.xhr.parentNode == domDebugger){
			domDebugger.removeChild(domDebugger.xhr)
			xhrTab.style.backgroundColor = ""
			return true
		}
		return false
	}

	var xhrTab = library.clone("wrapper")
	xhrTab.innerText = "XHR"
	xhrTab.className += " tab-header"
	xhrTab.addEventListener("click", function(){
		
		if (!closeXhr()){
			domDebugger.appendChild(domDebugger.xhr)
			xhrTab.style.backgroundColor = "inherit"
		}
		calculateBodyExtention()
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
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
		}
	`
	if (document.readyState === "complete"){
		document.body.appendChild(domDebugger)
	}
	document.addEventListener("readystatechange", function(){
		if (document.readyState === "complete"){
			calculateBodyExtention()
		}
	})
