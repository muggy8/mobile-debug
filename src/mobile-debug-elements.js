	library.add(`
		<div id="htmlContainer" class="data-div">
			<div class="html-open"></div>
			<div class="html-body">...</div>
			<div class="html-close"></div>
		</div>
	`)
	var createDomHtmlRepresentation = function(ele){
		var clone = ele.cloneNode()
		var nodeText = clone.outerHTML
		var closingTag = nodeText.match(/<\/[^>]+>/)[0]
		var oppeningTag = nodeText.replace(closingTag, "")

		return {
			close: closingTag,
			open: oppeningTag
		}
	}
