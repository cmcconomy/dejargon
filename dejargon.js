function getTextNodes() {
	var textNodes = [];
	var elements = document.getElementsByTagName('*');

	for( var i=0; i<elements.length; i++ ) {
		var element = elements[i];
		// skip 'special' dom nodes
		switch(element.nodeName.toLowerCase()) {
			case 'script':
			case 'style':
			case 'title':
				continue;
		}
		for (var j = 0; j < element.childNodes.length; j++) {
			var node = element.childNodes[j];
			if (node.nodeType == Node.TEXT_NODE && /\S/.test(node.nodeValue)) {
				textNodes.push(node);
			}
		}
	}

	return textNodes;
}

// see - http://stackoverflow.com/a/15604206

function getJargonRegExp(jargonList) {
	// problem(?) -- matches substrings, eg. jargon of 'test' would match 'fastest'.
	return new RegExp(Object.keys(jargonList).join('|'), "gi");
}

function filterTextNodes(textNodes, jargonList) {
	var jargonRegex = getJargonRegExp(jargonList);
	// lastIndex needs to be reset on every invocation in filter so that the whole string is searched with test()
	return textNodes.filter(node=>{jargonRegex.lastIndex=0;return jargonRegex.test(node.nodeValue)});
}

function replaceJargon(jargonTextNodes, jargonList) {
	var jargonRegex = getJargonRegExp(jargonList);

	// I defined this here because it depends on jargonList in this closure
	var generateTooltipNode = function(jargon) {
		var highlight = document.createElement('span');
		highlight.setAttribute('class','dej-highlight');
		highlight.appendChild(document.createTextNode(jargon));
	
		var tooltip = document.createElement('span');
		tooltip.setAttribute('class', 'dej-tooltip');
		tooltip.appendChild(document.createTextNode(jargonList[jargon.toLowerCase()]));
		
		highlight.appendChild(tooltip);
		return highlight;
	}

	jargonTextNodes.forEach(function(textNode) {
		var text = textNode.nodeValue;
		var parentNode = textNode.parentNode;
		var replacementNodes = [];

		// reset for new set of exec()'s
		jargonRegex.lastIndex=0;
		// this is the index where non-jargon text was last observed. 
		var lastTextIndex=0;

		var match = jargonRegex.exec(text);
		while( match != null ) {
			if( lastTextIndex < match.index ) {
				// some plain text remains after last match
				replacementNodes.push(document.createTextNode(text.substring(lastTextIndex,match.index)));
			}

			var jargon = match[0];
			replacementNodes.push(generateTooltipNode(jargon));

			lastTextIndex = match.index + jargon.length;
			match = jargonRegex.exec(text);
		}
		if( lastTextIndex < text.length ) {
			// some plain text remains after last match
			replacementNodes.push(document.createTextNode(text.substring(lastTextIndex)));
		}

		var replacementNode = document.createElement('span');
		replacementNodes.forEach(n=>{replacementNode.appendChild(n)});
		parentNode.replaceChild(replacementNode, textNode);
	});
}

function lowerCasify(jargonList) {
	var lcJargonList = {};
	Object.keys(jargonList).forEach(key=> {lcJargonList[key.toLowerCase()] = jargonList[key];});

	return lcJargonList;
}

// --- main here ---

chrome.storage.sync.get({
	jargonMap: {}
    }, function(items) {
	console.log("Applying Jargon Extension Logic");
	jargonList = lowerCasify(items.jargonMap);
	var textNodes = getTextNodes();
	var filteredTextNodes = filterTextNodes(textNodes,jargonList);

	replaceJargon(filteredTextNodes, jargonList);
});

