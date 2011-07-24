/* Start of class Sanitiser. */
function Sanitiser(language) {
	this.language = language;
	this.regex = /[^a-zA-Z0-9-]+/g; // default regex is for English
	switch (language) {
		case "french":
			this.regex = /[^a-zA-Z0-9-ÀÂÄÈÉÊËÎÏÔŒÙÛÜŸàâäèéêëîïôœùûüÿÇç]+/g;
			break;
		case "german":
			this.regex = /[^a-zA-Z0-9-ÄäÖöÜüß]+/g;
			break;
		case "italian":
			this.regex = /[^a-zA-Z0-9-ÀÈÉÌÒÓÙàèéìòóù]+/g;
			break;
		case "spanish":
			this.regex = /[^a-zA-Z0-9-ÁÉÍÓÚÑÜáéíóúñü]+/g;
			break;
		case "portuguese":
			this.regex = /[^a-zA-Z0-9-ÀÁÂÃÉÊÍÓÔÕÚÜàáâãéêíóôõúüÇç]+/g;
			break;
		case "swedish":
			this.regex = /[^a-zA-Z0-9-ÅåÄäÖö]+/g;
			break;
		case "finnish":
			this.regex = /[^a-zA-Z0-9-ÅåÄäÖö]+/g;
			break;
	}
}

Sanitiser.prototype.sanitise = function(word) {
	var sanitisedWord = word.replace(this.regex, '');
	sanitisedWord = sanitisedWord.toLowerCase();
	
	// Makes sure to return an empty string if the word is less than 3
	// characters long. This tells the stemmer to just completely
	// ignore the word.
	if (sanitisedWord.length < 3) {
		return "";
	} else {
		return sanitisedWord;
	}
}

/* End of class Sanitiser. */
