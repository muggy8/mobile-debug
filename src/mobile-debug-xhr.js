	var xhrHistory = {}
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
			var record = xhrHistory[Identifier] = Object.create(this)
			record.method = args[0]
			record.url = args[1]
			
			if (args[2]){
				record.username = args[3]
			}
			
			if (args[3]){
				record.password = args[4]
			}
			
			xhrOpen.apply(this, args)
		}
	})
	