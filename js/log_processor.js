/* This file actually TODO */

function processMessage(text) {
	var message = splitNameAndMessage(text);
	message.content = applyStoplist(stemText(message.content));
	return message;
}

function processLog(log) {
	// TODO: get a better way of differentiating each message 
	var messagesAsText = log.split('\n');
	var messages = [];
	for (var i in messagesAsText) {
		messages.push(processMessage(messagesAsText[i]));
	}
	return messages;
}