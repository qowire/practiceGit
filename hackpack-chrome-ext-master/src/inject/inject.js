/* File: inject.js
 * This file contains javascript code that is executed
 * everytime a webpage loads over HTTP or HTTPS.
 * Ben edit
 * Andrew Edit
Maurice Edit
 */

/*
 * Pass in the text to change as well as the settings
 * 	in the format of settings[key] = value (to change)
 * Checks if key is url: this is accessed in replaceAllImages
 * 	to replace images. 
 */
function modifyText(text, settings) {
	if (text.length < 1) return "";
	if (!settings) return "";
	Object.keys(settings).forEach(function(key) {
		if (text.indexOf(key) != -1 && key != "url") {
			var index = text.indexOf(key);
			text = text.substring(0, index) +
					settings[key] + 
					modifyText(text.substring(index + key.length), settings);
		}
	});
	return text;
}

/**
 * Pass in an array of lines in the form of 
 * "key -> value"
 * Returns the array of rules
 */
function parseSettings(lines) {
	// Currently, this method returns nothing. You'll have to
	// update this method to return the replacement rules.
	var rules = {};
	rules['cal'] = 'butt';
	rules['Cal'] = 'Butt';
	rules['CAL'] = 'BUTT';
	rules['cAl'] = 'bUTt';
	rules['cAL'] = 'buTT';
	for (var i = 0; i < lines.length; i++) {
		var pair = lines[i].split(" -> ");
		var word1 = pair[0];
		var word2 = pair[1];
		rules[word1] = word2;
	}
	return rules;
}

/**
 * Function replaces all the images on the page
 * 	and gets the url from key 'url' in map settings
 * If no url is present, images are not changed
 */
 function replaceAllImages(settings) {
 	var images = findAllImages();
 	if (settings['url']) {
 		replaceImages(images, settings['url']);
 	}
 	return;
 }
/**
 * Returns all the images on the page
 */
 function findAllImages() {
 	var images = document.getElementsByTagName('img');
 	return images;
 }
/**
 * Replaces the images using an array of images and 
 * 	a url passed in
 */
 function replaceImages(images, url) {
 	for (var i = 0; i < images.length; i++) {
 		images[i].src = url;
 	}
 }
 
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			// This part of the script triggers when page is done loading
			clearInterval(readyStateCheckInterval);
			chrome.storage.local.get('settings', function(response) {
				var replacementRules = null;
				if (typeof chrome.runtime.lastError === 'undefined') {
					var settings = response.settings;
					lines = settings.split("\n").filter(function(line) {
						return line.indexOf("->") != -1;
					});
					replacementRules = parseSettings(lines);
				}
				walk(document.body, replacementRules);
				replaceAllImages(replacementRules)
			});
		}
	}, 10);
});

// Update a text node's contents
function handleText(textNode, settings)
{
	var text = textNode.nodeValue;
	var modifiedText = modifyText(text, settings);
	textNode.nodeValue = modifiedText;
}

// Full credit to: http://is.gd/mwZp7E
function walk(node, settings)
{
	var child, next;

	// For more info, read http://www.w3schools.com/jsref/prop_node_nodetype.asp
	switch (node.nodeType)
	{
		case 1:  // Element
		case 9:  // Document
		case 11: // Document fragment
			child = node.firstChild;
			while (child)
			{
				next = child.nextSibling;
				walk(child, settings);
				child = next;
			}
			break;

		case 3: // Text node
			handleText(node, settings);
			break;
	}
}
