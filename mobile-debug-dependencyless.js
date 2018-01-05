dependencyBased.then
(function(){
	var converter = document.createElement("div")
	var library = peak = Object.create({
		add: function(nameOrEle, ele){
			var name
			if (ele){
				name = nameOrEle
			}
			else {
				ele = nameOrEle
			}
			name = ele.id || name // always take the id of the item over it's given name

			if (typeof ele == "string"){
				converter.innerHTML = ele
				Array.prototype.forEach.call(converter.children, function(child){
					library.add(child)
				})
			}

			// we only do this if we have a name and it's not already in use
			else if (name && !library[name]){
				// first thing's first, we move the element's id into it's class if it has one
				if (ele.id){
					var className = ele.className
					ele.className = ele.id
					if (className){
						ele.className += " " + className
					}
					ele.removeAttribute("id")
				}

				Object.defineProperty(library, name, {
					enumerable: false,
					configurable: false,
					writable: false,
					value: ele.cloneNode()
				})
			}
			else {
				console.warn("no name declared for element or the name is already in use")
			}
			return library
		},
		clone: function(name){
			if (library[name]){
				return library[name].cloneNode()
			}
			else {
				console.warn(name + " not found")
			}
		},
		convert: function(string){
			converter.innerHTML = ele
			if (converter.children.length){
				return converter.children[0]
			}
		}
	})
})
