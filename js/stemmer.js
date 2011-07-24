/* Start of class Stemmer. This class wraps the Snowball stemming library. */

/* Constructor:
 *   sanitiser - An instance of Sanitise.
 *   language - String that represents the language the stemmer
 *              is working with. */
function Stemmer(sanitiser, language) {
    this.sanitiser = sanitiser;
    this.stemmer = new Snowball(language);
    this.stemWord = function (word) {
        this.stemmer.setCurrent(word);
        this.stemmer.stem();
        return this.stemmer.getCurrent();
    };
}

Stemmer.prototype.stemText = function(text) {    
    var words = text.split(" ");
    var stemmedText = "";
    for (var i in words) {
        var sanitisedWord = this.sanitiser.sanitise(words[i]);
        // Only stem strings that aren't empty
        if (sanitisedWord.length > 0) {
            // NOTE: may cause problems with 'this' parameter in future
            stemmedText += this.stemWord(sanitisedWord) + " ";
        }
    }
    return stemmedText;
}

/* End of class Stemmer */