/* ---------------------------------------------------------- */
/*                            HTML                            */
/* ---------------------------------------------------------- */

function HTMLStatistics(text, sendMessage) {
	this.text = text;
	this.sendMessage = sendMessage;
	this.stage = 0;

	this.totalLines = 0;
	this.whitespaceLines = 0;
	this.commentLines = 0;
	this.codeLines = 0;

	this.tagCount = 0;
	this.linkCount = 0;
	this.imageCount = 0;
	this.frameCount = 0;
	this.objectCount = 0;

	this.totalStyleCount = 0;
	this.cssIDCount = 0;
	this.cssClassCount = 0;
	this.inlineStyleCount = 0;

	this.extStylesheetCount = 0;
	this.intStylesheetCount = 0;
	this.extScriptCount = 0;
	this.intScriptCount = 0;

	this.tagFrequencies = {};
	this.relativeTagFrequencies = {};
	// NOTE: style means classes, IDs AND inline styles in this case
	this.styleFrequencies = {};
	this.relativeStyleFrequencies = {};
}

HTMLStatistics.prototype.run = function(value) {
	switch (this.stage) {
	case 0: // main parsing
		this.sendMessage("Parsing HTML...");

		try {
			var stats = this;
			HTMLParser(this.text, {
				start: function(tag, attrs, unary) {
					// Tag counting
					stats.tagCount += 1;
					if (tag in stats.tagFrequencies) {
						stats.tagFrequencies[tag] += 1;
					} else {
						stats.tagFrequencies[tag] = 1;
					}

					// Resource counting
					if (tag == "style") {
						stats.intStylesheetCount += 1;
					} else if (tag == "link") {
						// If it's got the rel attribute it says stylesheet, assume external stylesheet
						for (var i in attrs) {
							if (attrs[i].name == "rel" && attrs[i].escaped == "stylesheet") {
								stats.extStylesheetCount += 1;
								break;
							}
						}
					} else if (tag == "script") {
						var hasSrc = false;
						for (var i in attrs) {
							if (attrs[i].name == "src") {
								stats.extScriptCount += 1;
								hasSrc = true;
								break;
							}
						}
						// If <script> doesn't have a src attribute, just assume there's an internal script
						if (!hasSrc) stats.intScriptCount += 1;
					}

					// Style counting
					for (var i in attrs) {
						// Tries to find style
						var style = "";
						if (attrs[i].name == "id") {
							style = "#" + attrs[i].escaped;
						} else if (attrs[i].name == "class") {
							style = "." + attrs[i].escaped;
						} else if (attrs[i].name == "style") {
							style = "inline: { " + attrs[i].escaped + " }";
						}
						// If one was found, add it
						if (style != "") {
							if (style in stats.styleFrequencies) {
								stats.styleFrequencies[style] += 1;
							} else {
								// Since this is a new style, update the counters!
								if (style.charAt(0) == "#") stats.cssIDCount += 1;
								else if (style.charAt(0) == ".") stats.cssClassCount += 1;
								else if (style.substring(0, 6) == "inline") stats.inlineStyleCount += 1;

								stats.styleFrequencies[style] = 1;
							}
						}
					}
				},

				comment: function(text) {
					stats.commentLines += text.split("\n").length;
				}

			});
		} catch (err) {
			// Error parsing text, set error flag to true
			this.error = true;
		}

		// Calculates how many of each type of line there are (except for
		// comment lines, which are calculated in the HTML Parser
		var lines = this.text.split("\n");
		this.totalLines = lines.length;

		this.whitespaceLines = 0;
		for (var i in lines) {
			var matches = lines[i].match(/^\s*?$/);
			if (matches != null && matches.length > 0) {
				this.whitespaceLines += 1;
			}
		}

		this.codeLines = this.totalLines - this.whitespaceLines - this.commentLines;

		this.stage += 1;
		break;
	case 1: // relative frequency processing
		this.sendMessage("Calculating relative frequencies...");

		for (var tag in this.tagFrequencies) {
			this.relativeTagFrequencies[tag] = this.tagFrequencies[tag] / this.tagCount;
		}

		this.totalStyleCount = this.cssIDCount + this.cssClassCount + this.inlineStyleCount;
		for (var style in this.styleFrequencies) {
			this.relativeStyleFrequencies[style] = this.styleFrequencies[style] / this.totalStyleCount;
		}

		this.stage += 1;
		break;
	case 2: // tag processing (cont.)
		this.sendMessage("Counting tags...");

		this.linkCount = this.tagFrequencies["a"] || 0;
		this.imageCount = this.tagFrequencies["img"] || 0;
		this.frameCount = (this.tagFrequencies["frame"] || 0) + (this.tagFrequencies["iframe"] || 0);
		this.objectCount = this.tagFrequencies["object"] || 0;

		this.stage += 1;
		return this;
	}
}

HTMLStatistics.prototype.getMostUsedTags = function(amount) {
	var sortedTags = toSortedTuples(this.tagFrequencies);

	var topTags = [];
	var count = 0;
	for (var i in sortedTags) {
		topTags.push([ sortedTags[i][0], sortedTags[i][1],
			this.relativeTagFrequencies[sortedTags[i][0]] ]);

		count += 1;
		if (count >= amount) break;
	}
	return topTags;
}

HTMLStatistics.prototype.getMostUsedStyles = function(amount) {
	var sortedStyles = toSortedTuples(this.styleFrequencies);

	var topStyles = [];
	var count = 0;
	for (var i in sortedStyles) {
		topStyles.push([ sortedStyles[i][0], sortedStyles[i][1],
			this.relativeStyleFrequencies[sortedStyles[i][0]] ]);

		count += 1;
		if (count >= amount) break;
	}
	return topStyles;
}



/* ---------------------------------------------------------- */
/*                           General                          */
/* ---------------------------------------------------------- */

// TODO