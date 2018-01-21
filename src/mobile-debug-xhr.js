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
					Array.prototype.forEach.call(xhrDetails.children, function(item){
						xhrList.removeChild(item)
					})

					console.log(createXhrDetailedView(xhrWrapper))
				})

				xhrList.appendChild(xhrItem)
				xhrItem.className += " xhr-list-item"
			}(request, xhrHistory[request])
		}
	}

	var createXhrDetailedView = function(xhrWrapper){
		console.log(xhrWrapper)
	}
