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

	// If text STARTS with something in square brackets (e.g. "[DJ]Hello.")
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
	}

];