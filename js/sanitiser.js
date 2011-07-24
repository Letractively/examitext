var SANITISERS = [

	// English
	/* Sanitises an English word by removing all non-alphanumeric characters,
	 * whitespace and not returning words less than 3 characters long. */
	function (word) {
		// Removes non-alphanumeric characters from the word, EXCEPT for dashes!
		// NOTE: Use /[^a-zA-Z0-9]+/g to remove dashes too	
		var sanitisedWord = word.replace(/[^a-zA-Z0-9-]+/g, '');
		// Makes sure to return an empty string if the word is less than 3
		// characters long. This tells the stemmer to just completely
		// ignore the word.
		if (sanitisedWord.length < 3) {
			return "";
		} else {
			return sanitisedWord;
		}
	}

	// French
	function (word) {
		// TODO
	}

	// German
	function (word) {
		// TODO
	}

];

