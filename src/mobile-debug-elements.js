	library.add(`
		<div id="htmlContainer" class="data-div">
			<div class="html-open"></div>
			<div class="html-body">...</div>
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
			var closingTagMatch = nodeText.match(/<\/[^>]+>/)
			if (!closingTagMatch){
				return
			}
			var closingTag = closingTagMatch[0]
			var oppeningTag = nodeText.replace(closingTag, "")
			var childNodes = ele.childNodes

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
