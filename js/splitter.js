/* Attempts to split the given text into a { name : message } pair,
 * where name is the name of the sender and message is the actual
 * content of the message. If no name is found, the name field is
 * just left blank. */
function splitNameAndMessage(text) {
	var index = 0;
	var message = { "name" : "", "content" : text };

	while (index < matches.length && message.name == "") {
		message = matches[index](text);
		++index;
	}

	return message;
}

/* Each of these functions attempts to search for a different name
 * specifying format, return an empty string if the text doesn't
 * match that format. */
var matches = [

	/* If text contains something in square brackets which has a colon
	 * straight after it (e.g. "[Name]:Message"), then treat whatever is
	 * in the square brackets as the name.. */
	function(text) {	
		var splittedText = text.split(/\[(.*)\]:/);
		if (splittedText.length > 1) {
			// Ignore the first element since that was BEFORE the name
			// If it's not empty, it'll just be metadata like time sent and stuff
			var name = splittedText[1];
			var content = "";

			for (var i = 2; (i < splittedText.length); ++i) {
				content += splittedText[i];
			}
			
			return { "name" : name, "content" : content };
		} else {
			return { "name" : "", "content" : text };
		}
	},

	/* If text contains "says:" or "says\n" (\n being a new line), take
	 * everything BEFORE "says:" as the name, and everything after as
	 * the message. */
	function(text) {
		var index = text.indexOf("says:");
		// If the substring could not be found, try the same but with
		// a newline instead of a colon
		if (index == -1) {
			index = text.indexOf("says\n");
		}
		
		// If it's been found, get the name
		var name = "";
		if (index >= 0) {
			name = text.slice(0, index);
			text = text.substring(index + 5); // remove "says:""
		}

		return { "name" : name, "content" : text };
	},

	/* If text's first word ends with a colon, assume that the first
	 * word is a name, and the text after that the colon is the message.
	 * As soon as this function comes across a space, it aborts and
	 * stops trying to find the name. */
	function(text) {
		for (var i = 0; (i < text.length); ++i) {
			if (text.charAt(i) == ':') {
				return { "name" : text.substring(0, i), "content" : text.substring(i + 1) };
			} else if (text.charAt(i) == ' ') {
				return { "name" : "", "content" : text };
			}
		}

		// If a name hasn't been found now, just return the default
		return { "name" : "", "content" : text };
	}

];