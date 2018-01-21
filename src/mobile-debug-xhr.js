	var xhrHistory = {}
	var activeXhrs = []
	var protoXhr = XMLHttpRequest.prototype
	var xhrOpen = protoXhr.open
	var xhrSend = protoXhr.send

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
			})
		}
	})
