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
