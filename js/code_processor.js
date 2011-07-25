/* Useful function for finding how many pairs of tags with the given
 * name 'tag' there are in 'text'. 'closing' should be set to true
 * if the tag you're looking for is a self-closing tag, like <img />. */
 function numTags(text, tag, closing) {
 	var re = undefined;
 	if (closing) {
 		re = new RegExp("<" + tag + "[^>]+>", "g");
 	} else {
 		re = new RegExp("<" + tag + "[^>]*>(.*?)<\/" + tag + ">", "g"); 
 	}
	var matches = text.match(re);

	return ((matches == null) ? 0 : matches.length);;
}

function HTMLStatistics(text, sendMessage) {
	this.text = text;
	this.sendMessage = sendMessage;
	this.stage = 0;

	this.totalLines = 0;
	this.whitespaceLines = 0;
	this.commentCount = 0;
	this.codeLines = 0;

	this.tagCount = 0;
	this.linkCount = 0;
	this.imageCount = 0;
	this.frameCount = 0;
	this.objectCount = 0;

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
	case 0: // basic statistics
		this.sendMessage("Calculating initial statistics...");

		//var lines = this.text.split(/\n|\r|\r\n/);
		var lines = this.text.split("\n");
		this.totalLines = lines.length - 1;

		this.whitespaceLines = 0;
		for (var i in lines) {
			var matches = lines[i].match(/^\s*?$/);
			if (matches != null && matches.length > 0) {
				this.whitespaceLines += 1;
			}
		}

		// Tries to find all the comments using the regex
		// From: http://ostermiller.org/findhtmlcomment.html
		var commentMatches = this.text.match(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/);
		this.commentCount = (commentMatches == null) ? 0 : commentMatches.length;
		this.codeLines = this.totalLines - this.whitespaceLines - this.commentCount; // not quite accurate

		this.tags = this.text.match(/<[^>]+>/ig);
		if (this.tags == null) {
			this.stage += 2; // skip next stage then if no tags
		} else {
			this.currentIndex = 0;
			this.stage += 1;
		}

		break;
	case 1: // tag processing
		var percent = (this.currentIndex / this.tags.length) * 100;
		this.sendMessage("Processed " + roundNumber(percent, 2) + "% of tags...");

		for (var count = 0; (count < 25); ++count) {
			var tag = this.tags[this.currentIndex];

			// First, strip everything but the name from the tag
			tag = tag.replace("<", " ").replace(">", " ");
			tag = trim(tag); // get rid of leading/trailing whitespace
			tag = tag.replace(/\s{2,}/, " "); // make everything one space
			tag = tag.split(" ")[0]; // get first word
			tag = tag.replace(/[^a-zA-Z]+/g, ""); // delete non-alpha characters
			// ignore empty tags
			if (tag.length > 0) {
				if (tag in this.tagFrequencies) {
					this.tagFrequencies[tag] += 1;
				} else {
					this.tagFrequencies[tag] = 0;
				}
			}
			
			this.currentIndex += 1;
			if (this.currentIndex >= this.tags.length) {
				this.tagCount = this.tags.length;

				for (var tag in this.tagFrequencies) {
					this.relativeTagFrequencies[tag] = this.tagFrequencies[tag] / this.tagCount;
				}

				this.stage += 1;
				break;
			}
		}

		break;
	case 2: // tag processing (cont.)
		this.sendMessage("Processing tags...");

		this.linkCount = this.tagFrequencies["a"] || 0;
		this.imageCount = this.tagFrequencies["img"] || 0;
		this.frameCount = (this.tagFrequencies["frame"] || 0) + (this.tagFrequencies["iframe"] || 0);
		this.objectCount = this.tagFrequencies["object"] || 0;

		this.stage += 1;
		break;
	case 3: // CSS processing (cont.)
		
		// TODO: count how many CSS styles and shit they are here

		this.stage += 1;
		break;
	case 4: // CSS processing (cont.)
		this.sendMessage("Processing CSS...");

		// TODO
		this.cssIDCount = 0; // count how many id='X' there are
		this.cssClassCount = 0; // count many many class='X' there are
		this.inlineStyleCount = 0; // count how many style='X' there are

		this.stage += 1;
		break;
	case 5: // resource processing
		this.sendMessage("Processing resources...");

		// TODO
		this.extStylesheetCount = 0; // count link rel="stylehseet"
		this.intStylesheetCount = 0; // count <style>
		this.extScriptCount = 0; // count <script> with hrefs
		this.intScriptCount = 0; // count <script> tags with stuff inside

		this.stage += 1;
		break
	case 6: // cleanup
		this.currentIndex = undefined;
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