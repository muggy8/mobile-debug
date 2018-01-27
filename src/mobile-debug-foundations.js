	var converter = document.createElement("div")

    var templates = {}
    var templateToElement = function(string){
        converter.innerHTML = string
        if (converter.children.length){
            return converter.children[0]
        }
    }

    templates.wrapper = `<div class="wrapper"></div>`

	var domDebugger = templateToElement(templates.wrapper)
	domDebugger.id = "mobile-debug"
	var stylesBlock = templateToElement(`<style></style>`)
	domDebugger.appendChild(stylesBlock)

	Object.defineProperty(domDebugger, "styles", {
		enumerable: false,
		configurable: false,
		get: function(){
			return stylesBlock.innerHTML
		},
		set: function(val){
			stylesBlock.innerHTML = val
			return val
		}
	})

	if (document.body){
		document.body.appendChild(domDebugger)
	}
	else {
		document.addEventListener("readystatechange", function(){
			if (document.readyState === "interactive"){
				document.body.appendChild(domDebugger)
			}
		})
	}

	domDebugger.styles += `
		#mobile-debug {
			border-color: #DDD;
		}
		#mobile-debug * {
			border-color: inherit;
            box-sizing: border-box;
		}
		#mobile-debug input,
		#mobile-debug textarea {
			background-color: transparent;
		}
	`

	// declare some globals so we can use them later and we can save space in the minified versions
	var append = function(parent, child){
		parent.appendChild(child)
	}
	var attachEvent = function(ele, ev, handler){
		ele.addEventListener(ev, handler)
	}
	var qs = function(ele_selector, selector){
		if (!selector){
			selector = ele_selector
			ele_selector = document
		}
		return ele_selector.querySelector(selector)
	}
	var protoSlice = function(source, start, end){
		return source && Array.prototype.slice.call(source, start, end)
	}
	var protoForEach = function(source, callback){
		return source && Array.prototype.forEach.call(source, callback)
	}
	var protoMap = function(source, callback){
		return source && Array.prototype.map.call(source, callback)
	}
	var protoReduce = function(source, callback, start){
		return source && Array.prototype.reduce.call(source, callback, start)
	}
	var stringReplace = function(str, replaceTarget, replaceWith){
		return str.replace(replaceTarget, replaceWith)
	}
	var click = "click"
	var doubleClick = "dblclick"
	var keyUp = "keyup"
