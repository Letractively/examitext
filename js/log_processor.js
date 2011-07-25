/* Start of class Participant */
function Participant(name) {
	this.name = name;

	this.messages = [];

	this.wordFrequencies = {};
	this.wordCount = 0;

	this.averageMessageDensity = 0;
	this.percentOfMessages = 0;
}

Participant.prototype.addMessage = function(messageContent) {
	messageContent = trim(messageContent);
	var words = messageContent.split(" ");
	for (var i in words) {
		if (words[i] == "") continue; // prevents empty strings getting through
		this.addWord(words[i]);
	}

	this.messages.push(messageContent);
}

Participant.prototype.addWord = function(word) {
	if (word in this.wordFrequencies) {
		this.wordFrequencies[word] += 1;
	} else {
		this.wordFrequencies[word] = 1;
	}
}

Participant.prototype.getMessageCount = function() {
	return this.messages.length;
}

Participant.prototype.getAverageMessageLength = function() {
	var total = 0;
	for (var i in this.messages) {
		total += this.messages[i].length
	}
	return total / this.getMessageCount();
}

Participant.prototype.getAverageMessageDensity = function() {
	return this.averageMessageDensity;
}

Participant.prototype.getRelativeWordFrequencies = function() {
	var relativeFrequencies = {};
	var total = this.getWordCount();
	for (var word in this.wordFrequencies) {
		relativeFrequencies[word] = this.wordFrequencies[word] / total;
	}
	return relativeFrequencies;
}

Participant.prototype.getWordCount = function() {
	var total = 0;
	for (var word in this.wordFrequencies) {
		total += this.wordFrequencies[word];
	}
	return total;
}

Participant.prototype.getMostSaidWords = function(amount) {
	// Sorts words by frequency, in descending order
	var sortedWords = toSortedTuples(this.wordFrequencies);
	var relativeWordFrequencies = this.getRelativeWordFrequencies();

	var topWords = [];
	var count = 0;
	for (var i in sortedWords) {
		topWords.push([ sortedWords[i][0], sortedWords[i][1],
			relativeWordFrequencies[sortedWords[i][0]] ]);

		count += 1;
		if (count >= amount) break;
	}
	return topWords;
}

/* End of class Participants */

/* Start of class Message */

function Message(text, stemmer, stoplist) {
	// Tries to find
	var index = 0;
	var values = { "name" : "", "content" : text };

	while (index < Message.nameSearchers.length && values.name == "") {
		values = Message.nameSearchers[index](text);
		++index;
	}

	this.name = values.name
	this.content = values.content;
	// Makes sure there's no whitespace in the name
	this.name = trim(values.name);
	// Also applies the given stemmer and stoplist to the message's content
	this.content = stoplist.apply(stemmer.stemText(this.content));
}

/* Each of these functions attempts to search for a different name
 * specifying format, return an empty string if the text doesn't
 * match that format. There are multiple ways because the chat log
 * the user provides could be formatted in any way, so as many format
 * parsers as possible are provided to cover most cases. */
Message.nameSearchers = [

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

/* End of class Message */


/* Start of class ChatStatistics */

function ChatStatistics(sendMessage) {
	this.participants = {};
	this.totalMessages = 0;
	this.sendMessage = sendMessage; // used to send messages to web page
}

ChatStatistics.prototype.run = function(messages) { // TaskQueue function
	for (var count = 0; (count < 25); ++count) {
		var message = messages[this.totalMessages];
		if (!(message.name in this.participants)) {
			this.participants[message.name] = new Participant(message.name);
		}
		this.participants[message.name].addMessage(message.content);

		this.totalMessages += 1;
		if (this.totalMessages >= messages.length) {
			// Calculates each participant's message density separately.
			if (messages.length >= 0) {
				densities = {};

				var currentName = messages[0].name;
				var currentCount = 1;
				for (var i = 1; (i < messages.length); ++i) {
					var message = messages[i];
					if (currentName != message.name) {
						if (currentName in densities) {
							densities[currentName].sum += currentCount;
							densities[currentName].amount += 1;
						} else {
							densities[currentName] = {};
							densities[currentName].sum = currentCount;
							densities[currentName].amount = 1;
						}
						currentName = message.name;
						currentCount = 0;
					}
					currentCount += 1;
				}

				for (var name in densities) {
					this.participants[name].averageMessageDensity =
						(densities[name].sum / densities[name].amount);
				}
			}

			// Calculates percentage of messages each participant contributed
			for (var name in this.participants) {
				this.participants[name].percentOfMessages =
					(this.participants[name].getMessageCount() / this.totalMessages) * 100;	
			}

			// Finally, renames blank entries into Anonymous
			if ("" in this.participants) {
				this.participants["Anonymous"] = this.participants[""];
				delete this.participants[""];
			}

			return this;
		}
	}
	this.sendMessage("Processed " + this.totalMessages + " out of " + messages.length + " messages.");
}

ChatStatistics.prototype.getTotalWordCount = function() {
	var total = 0;
	for (var name in this.participants) {
		total += this.participants[name].getWordCount();
	}
	return total;
}

ChatStatistics.prototype.getMessagePercentages = function() {
	var percentages = [];
	for (var name in this.participants) {
		var percent = this.participants[name].getMessageCount() / this.totalMessages;
		percentages.push([name, percent]);
	}
	return percentages;
}

/* End of class ChatStatistics */

/* Start of class LogProcessor
 * Wrapped in a class and not just a function since it needs to
 * added the task queue for asynchronous processing. */
function LogProcessor(logText, stemmer, stoplist, sendMessage) { // TaskQueue function
	this.lines = logText.split("\n");
	this.messages = [];
	this.currentIndex = 0;

	this.stemmer = stemmer;
	this.stoplist = stoplist;
	this.sendMessage = sendMessage
}

LogProcessor.prototype.run = function(value) {
	for (var count = 0; (count < 25); ++count) {
		this.messages.push(new Message(
			this.lines[this.currentIndex], this.stemmer, this.stoplist));

		this.currentIndex += 1;
		if (this.currentIndex >= this.lines.length) {
			return this.messages;
		}
	}
	this.sendMessage("Read " + this.currentIndex + " out of " + this.lines.length + " messages.");
}

/* End of class LogProcessor */
