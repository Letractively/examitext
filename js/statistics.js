/* Contains functions for gathering statistical data on the messages. */

/* Returns an array containing all the words in the given text. The
 * function removes any non-alphanumeric characters from the words
 * and all whitespace entries. */
function getWords(text) {
	var words = text.split(" ");

	// Removes non-alphanumeric characters from each word, EXCEPT for dashes!
	// NOTE: Use /[^a-zA-Z0-9]+/g to remove dashes too
	for (var i in words) {
		words[i] = words[i].replace(/[^a-zA-Z0-9 -]+/g, '');
	}
	// Makes sure to remove any 0, 1 or 2 letters words from the array
	for (var i = 0; (i < words.length); ++i) {
		if (words[i].length < 3) {
			words.splice(i, 1)
			i -= 1;
		}
	}

	return words;
}

/* Takes a list of messages (associative arrays with 'name' and 'content'
 * attributes) and returns a map where the keys are each participant's
 * (of the chat) name and the value is another map where the keys are
 * the words and the values their frequencies. */
function getWordFrequencies(messages) {
	var participants = {};

	for (var i in messages) {
		var message = messages[i];
		if (!(message.name in participants)) {
			participants[message.name] = {};
		}

		var words = getWords(message.content);
		for (var j in words) {	
			var word = words[j];
			/* NOTE: A really lame hack. If "constructor" is used as a key in
			 * the map, it actually thinks I'm trying to assign a constructor
			 * to the associative array (since they are the same as objects in
			 * JavaScript). Just make all instances of "constructor" "_constructor"
			 * to avoid the problem. */
			if (word == "constructor") word = "_constructor";
			if (word in participants[message.name]) {
				participants[message.name][word] += 1;
			} else {
				participants[message.name][word] = 1;
			}
		}
	}

	return participants;
}

/* Takes a map (where the word is the key and its frequency is
 * the value) and returns the total amount of words. */
function getTotalWordCount(wordFrequencies) {
	var total = 0;
	for (var i in wordFrequencies) {
		total += wordFrequencies[i];
	}
	return total;
}

/* Given a map of participaints and their word frequencies, this
 * function returns a similarly structured map which contains
 * each word's RELATIVE frequency instead. */
function getRelativeWordFrequencies(participants) {
	var relFrequencies = {};

	for (var i in participants) {
		relFrequencies[i] = {};

		var total = getTotalWordCount(participants[i]);
		for (var j in participants[i]) {
			relFrequencies[i][j] = participants[i][j] / total;
		}
	}

	return relFrequencies;
}

/* Takes an array of message objects and returns a map where the
 * key is the name of each speaker and the value is their average
 * message density. Message density is this context is defined
 * as how many messages a person sends consecutively before
 * someone else sends a message. */
function getAverageMessageDensities(messages) {
	var messageDensities = {};

	// Makes sure messages is not an empty array (if so, will crash
	// when accessing messages[0] below)
	if (messages.length == 0) return {};

	var currentName = messages[0].name;
	var currentCount = 1;
	for (var i = 1; (i < messages.length); ++i) {
		var message = messages[i];
		if (currentName != message.name) {
			if (currentName in messageDensities) {
				messageDensities[currentName].sum += currentCount;
				messageDensities[currentName].amount += 1;
			} else {
				messageDensities[currentName] = {};
				messageDensities[currentName].sum = currentCount;
				messageDensities[currentName].amount = 1;
			}
			currentName = message.name;
			currentCount = 0;
		}
		currentCount += 1;
	}



	var averageMessageDensities = {};
	for (var name in messageDensities) {
		averageMessageDensities[name] = messageDensities[name].sum / messageDensities[name].amount;
	}
	return averageMessageDensities;
}



/* This function collects ALL the statistics implemented for a chat log.
 * It returns an object with two attributes:
 * participants : Associative array where the key is a participant's
 *                and the value is an object which contains statistics
 *                on that participant.
 * totalMessages : Integer representing total messages in the chat log. */
function getLogStatistics(messages) {
	var participants = {};
	var totalMessages = 0;

	// Acquire the sum of each participant's messages' lengths and the number
	// of messages they've wrote.
	for (var i in messages) {
		var message = messages[i];

		if (message.name in participants) {
			participants[message.name].averageMessageLength += message.content.length;
			participants[message.name].numMessages += 1;

			totalMessages += 1;
		}
		else {
			// Create the participant object since it doesn't exist yet
			participants[message.name] = {}
			participants[message.name].averageMessageLength = message.content.length;
			participants[message.name].numMessages = 1;

			totalMessages += 1;
		}
	}

	// Get the word (relative) frequencies for each participant
	var wordFrequencies = getWordFrequencies(messages);
	var relativeWordFrequencies = getRelativeWordFrequencies(wordFrequencies);
	var averageMessageDensities = getAverageMessageDensities(messages);

	// Now calculate the average message length and percent of messages constributed
	// using the data acquired
	for (var name in participants) {
		participants[name].averageMessageLength /= participants[name].numMessages;
		participants[name].percentOfMessages = (
			participants[name].numMessages / totalMessages) * 100;

		// Also add the participants word frequency data to their object
		if (name in wordFrequencies) {
			participants[name].wordFrequency = wordFrequencies[name];
			participants[name].relativeWordFrequency = relativeWordFrequencies[name];
			participants[name].averageMessageDensity = averageMessageDensities[name];

			participants[name].wordCount = getTotalWordCount(participants[name].wordFrequency);
		} else {
			participants[name].wordFrequency = {};
			participants[name].relativeWordFrequence = {};
			participants[name].averageMessageDensity = 0;
			participants[name].wordCount = 0;
		}
	}

	// If there's an empty string as a key in the map, rename it to Anonymous
	if ("" in participants) {
		participants["Anonymous"] = participants[""];
		participants["Anonymous"].averageMessageDensity = 0;
		delete participants[""];
	}

	// Add the general stats and participant data to an object and return it
	var stats = {};
	stats.participants = participants;
	stats.totalMessages = totalMessages;
	return stats;
}