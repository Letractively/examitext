/* Start of class Tokeniser */
function Tokeniser() {
	this.reset();
}

Tokeniser.prototype.reset = function() {
	this.tokens = [];
	this.text = "";

	this.index = 0;
	this.previousCh = "";
	this.ch = "";
	this.charBuffer = "";
	this.lookingForNumber = false;
}

Tokeniser.prototype.tokenise = function(text) {
	this.reset();
	this.text = text;

	var checkEquals = false; // temp flag

	do {
		this.nextCharacter();

		// if checkEquals is set, that means the previous character was a symbol
		// that could be combined with the assignment operator. Check if the
		// current character is = and then store it in a token along with the
		// previous character if so.
		if (checkEquals) {
			if (this.ch == "=") {
				this.storeCharacter();
				this.nextCharacter();
			}

			this.addTokenAndClearBuffer();
			checkEquals = false;
		}

		// Skip past comments and whitespace
		if (this.previousCh == "/" && this.ch == "/") { // line comment
			this.addTokenAndClearBuffer();
			
			while (this.ch != "\n") {
				this.nextCharacter();
			}
		} else if (this.previousCh == "/" && this.ch == "*") { // block comment
			this.addTokenAndClearBuffer();

			while (this.previousCh != "*" || this.ch != "/") {
				this.nextCharacter();
			}
		} else if (this.isWhitespace(this.ch)) { // whitespace
			this.addTokenAndClearBuffer();

		/* String literals */
		} else if (this.ch == "\"") {
			this.storeCharacter();
			this.nextCharacter();
			while (this.ch != "\"") {
				this.storeCharacter();
				this.nextCharacter();
			}
			this.addTokenAndClearBuffer();
		} else if (this.ch == "\'") {
			this.storeCharacter();
			this.nextCharacter();
			while (this.ch != "\'") {
				this.storeCharacter();
				this.nextCharacter();
			}
			this.addTokenAndClearBuffer();

		} else if (!this.isAlphanumeric(this.ch)) { // symbol
			// If previous char is not symbol, store that before processing symbol
			if (this.isAlphanumeric(this.previousCh))
				this.addTokenAndClearBuffer();

			this.storeCharacter();

			// If it's a symbol that can be succeeded by a =, then set the check flag
			if (this.ch == "=" || this.ch == "+" || this.ch == "-" || this.ch == "*"
				|| this.ch == "/" || this.ch == "^" || this.ch == "%" || this.ch == "<"
				|| this.ch == ">") {
				checkEquals = true;
			// Otherwise, just add the symbol as a token
			} else {
				this.addTokenAndClearBuffer();
			}

		} else if (this.isNumeric(this.ch)) { // digit
			if (this.charBuffer == "") {
				this.lookingForNumber = true;
			}
			this.storeCharacter();

		} else { // alpha character
			if (this.lookingForNumber) {
				this.addTokenAndClearBuffer();
			}
			this.storeCharacter();
		}
	} while (this.ch);

	return this.tokens;
}

Tokeniser.prototype.nextCharacter = function() {
	this.previousCh = this.ch;
	this.ch = this.text.charAt(this.index++); // starts at 0
}

Tokeniser.prototype.storeCharacter = function() {
	this.charBuffer += this.ch;
}

Tokeniser.prototype.addTokenAndClearBuffer = function() {
	if (this.charBuffer != "") {
		// protects against inadvertant constructor assignment
		if (this.charBuffer == "constructor") this.charBuffer = "_constructor";

		this.tokens.push(this.charBuffer);
		this.charBuffer = "";
		this.lookingForNumber = false;
	}
}

Tokeniser.prototype.isAlphanumeric = function(theChar) {
	theChar = theChar.charCodeAt(0);
	if ((theChar < 48) || (theChar > 122) || 
	   ((theChar > 57) && (theChar < 65)) || 
	   ((theChar > 90) && (theChar < 97))) {
		return false;
	} else {
		return true;
	}
}

Tokeniser.prototype.isNumeric = function(theChar) {
	return ((theChar >= "0") && (theChar <= "9"));
}

Tokeniser.prototype.isWhitespace = function(theChar) {
	return (theChar == " " || theChar == "\t" || theChar == "\r" || theChar == "\n");
}

/* End of class Tokeniser */