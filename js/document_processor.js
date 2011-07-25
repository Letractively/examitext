function DocumentStatistics(text, stemmer, stoplist, sendMessage) {
	this.text = text;
	this.stemmer = stemmer;
	this.stoplist = stoplist;
	this.sendMessage = sendMessage;

	// The current processing stage, used to determine what task
	// should be done when the class' run() methodi s called.
	this.stage = 0;
	this.currentIndex = 0;

	// Will contain statistics calculated
	this.paragraphLengths = [];
	this.wordFrequencies = {};
	this.relativeWordFrequencies = {};
	this.wordCount = 0;
	this.lineCount = 0;
	this.paragraphCount = 0;
	this.sentenceCount = 0;
	this.averageSentenceLength = 0;
}

DocumentStatistics.prototype.run = function(value) {
	switch (this.stage) {
	case 0: // calculate simple statistics
		this.sendMessage("Calculating general statistics...");

		this.lineCount = this.text.count("\n");

		// Calculates paragraph amount, length of each paragraph and
		// average paragraph size
		var paragraphs = this.text.replace(/\n$/gm, '').split(/\n/);
		this.paragraphLengths = [];
		for (var i in paragraphs) {
			this.paragraphLengths.push(paragraphs[i].length);			
		}

		// Sentence count and average sentence length			
		var sentences = this.text.split(".");
		var total = 0;
		this.sentenceCount = sentences.length;
		for (var i in sentences) {
			total += sentences[i].length;
		}
		this.averageSentenceLength = total / this.sentenceCount;
		
		this.stage += 1;
		break;
	case 1: // count how many words there are
		this.sendMessage("Counting total words...");

		// replaces any whitespace with single space
		var trimmedText = this.text.replace(/\s+/, " "); 
		var words = trimmedText.split(" ");
		this.wordCount = words.length;

		this.stage += 1;
		break;
	case 2: // prepare entire document's text for stemming by splitting it up
		this.splittedText = this.text.chunk(5000);
		this.processedText = "";
		this.currentIndex = 0;

		this.stage += 1;
		break;
	case 3: // stem all the text
		var percent = (this.currentIndex / this.splittedText.length) * 100;
		this.sendMessage("Stemmed " + roundNumber(percent, 2) + "% of document");

		var t = this.splittedText[this.currentIndex];
		this.processedText += this.stoplist.apply(this.stemmer.stemText(t));

		this.currentIndex += 1;
		if (this.currentIndex >= this.splittedText.length) {
			this.wordList = this.processedText.split(" ");
			this.stemmedWordCount = 0; // initialise new word count

			// reset this since we're using it for the next stage too
			this.currentIndex = 0;
			this.stage += 1;
		}

		break;
	case 4: // calculate frequency of each word
		var percent = (this.currentIndex / this.wordList.length) * 100;
		this.sendMessage(roundNumber(percent, 2) + "% of word frequencies calculated...");

		for (var count = 0; (count < 25); ++count) {
			var word = this.wordList[this.currentIndex];
			if (word.length > 0) { // ensures no empty strings are processed
				if (word in this.wordFrequencies) {
					this.wordFrequencies[word] += 1;
				} else {
					this.wordFrequencies[word] = 1;
				}
				this.stemmedWordCount += 1;
			}

			this.currentIndex += 1;
			if (this.currentIndex >= this.wordList.length) {
				this.stage += 1;
				break;
			}
		}
		
		break;
	case 5: // calculate relative frequencies of each word
		this.sendMessage("Calculating relative word frequency...");

		for (var word in this.wordFrequencies) {
			this.relativeWordFrequencies[word] =
				this.wordFrequencies[word] / this.stemmedWordCount
		}

		this.stage += 1;
		break;
	case 6: // cleanup
		this.processedText = undefined;
		this.splittedText = undefined;
		this.wordList = undefined;
		this.stemmedWordCount = undefined;

		this.stage += 1
		return this; // tells TaskQueue that processing has been completed
	}
}

DocumentStatistics.prototype.numberOf = function(character) {
	// number of specific character (really just used for puncuation)
	return this.text.split(character).length - 1;
}

DocumentStatistics.prototype.getParagraphCount = function() {
	return this.paragraphLengths.length;
}

DocumentStatistics.prototype.getAverageParagraphLength = function() {
	var total = 0;
	for (var i in this.paragraphLengths) {
		total += this.paragraphLengths[i];
	}
	return total / this.getParagraphCount();
}

DocumentStatistics.prototype.getMostSaidWords = function(amount) {
	// Sorts words by frequency, in descending order
	var sortedWords = toSortedTuples(this.wordFrequencies);

	var topWords = [];
	var count = 0;
	for (var i in sortedWords) {
		topWords.push([ sortedWords[i][0], sortedWords[i][1],
			this.relativeWordFrequencies[sortedWords[i][0]] ]);

		count += 1;
		if (count >= amount) break;
	}
	return topWords;
}