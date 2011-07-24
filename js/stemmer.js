/* Start of class Stemmer. This class wraps the Snowball stemming library. */

/* Constructor:
 *   sanitiseFunction - Function which takes a word and returns
 *                      a cleaned up (e.g. all lowercase, no
 *                      punctuation, etc. 
 *   language - String that represents the language the stemmer
 *              is working with. */
function Stemmer(sanitiseFunction, language) {
    this.sanitise = sanitiseFunction;
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
        var sanitisedWord = this.sanitise(words[i]);
        // Only stem strings that aren't empty
        if (sanitisedWord.length > 0) {
            // NOTE: may cause problems with 'this' parameter in future
            stemmedText += this.stemWord(sanitisedWord) + " ";
        }
    }
    return stemmedText;
}

/* End of class Stemmer */