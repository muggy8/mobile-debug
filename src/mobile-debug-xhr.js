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
			var args = Array.prototype.slice.call(arguments)
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

			currentXhr.addEventListener("loadend", function(){
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

	var xhrModule = library.clone("wrapper")
	var xhrList = library.clone("wrapper")
	xhrList.id = "xhrList"
	xhrDetails = library.clone("wrapper")
	xhrDetails.id = "xhrDetails"
	xhrModule.appendChild(xhrList)
	xhrModule.appendChild(xhrDetails)

	domDebugger.appendChild(domDebugger.xhr = xhrModule)

	domDebugger.styles += `
		#mobile-debug .xhr-list-item {
			padding: 0.5em;
			border-bottom: 1px solid #CCC;
		}
		#mobile-debug #xhrList,
		#mobile-debug #xhrDetails {
			border: solid 1px #CCC;
			height: 200px;
			overflow: auto;
		}
	`

	var generateXhrListView = function(){
		// clear all children first
		Array.prototype.forEach.call(xhrList.children, function(item){
			xhrList.removeChild(item)
		})

		for (var request in xhrHistory){
			void function(label, xhrWrapper){
				var xhrItem = createDomStringRepresentation(label)
				xhrItem.addEventListener("click", function(){
					console.log(createXhrDetailedView(xhrWrapper))
				})

				xhrList.appendChild(xhrItem)
				xhrItem.className += " xhr-list-item"
			}(request, xhrHistory[request])
		}
	}

	var createXhrDetailedView = function(xhrWrapper){
		console.log(xhrDetails.children.length)
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

		// responce view toggle button
		var responceButton = document.createElement("button")
		responceButton.innerText = "Responce"
		responceButton.addEventListener("click", function(){
			xhrStatsView.forEach(function(item){
				item.parentNode == xhrDetails && xhrDetails.removeChild(item)
			})
			xhrDetails.appendChild(resultsView)
		})

		// stats view toggle button
		var statsButton = document.createElement("button")
		statsButton.innerText = "Stats"
		statsButton.addEventListener("click", function(){
			resultsView.parentNode == xhrDetails && xhrDetails.removeChild(resultsView)
			xhrStatsView.forEach(function(item){
				xhrDetails.appendChild(item)
			})
		})

		// append default view to the right div
		xhrDetails.appendChild(responceButton)
		xhrDetails.appendChild(statsButton)
		xhrDetails.appendChild(resultsView)
	}
