/* Contains functions for gathering statistical data on the messages. */

/* Returns an array containing all the words in the given text. The
 * function removes any non-alphanumeric characters from the words
 * and all whitespace entries. */
function getWords(text) {
	var words = message.content.split(" ");

	// Only keeps alphanumeric characters in each word
	for (var i in words) {
		words[i] = words[i].replace(/[^a-zA-Z 0-9]+/g, '');
		if (words[i] == "") words.splice(i, 1); // inefficient, change later
	}

	// Removes the whitespace entries from the array
	var index = words.indexOf(' ');
	if (index >= 0) words.splice(index, 1);
	index = words.indexOf('\n');
	if (index >= 0) words.splice(index, 1);
	index = words.indexOf('\r');
	if (index >= 0) words.splice(index, 1);
	index = words.indexOf('\t');
	if (index >= 0) words.splice(index, 1);
	index = words.indexOf('');
	if (index >= 0) words.splice(index, 1);

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