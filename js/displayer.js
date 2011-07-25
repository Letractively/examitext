/* Functions for displaying the calculated statistics. */

function showMessage(message, showTime) { // NOTE: showTime is optional parameter
	$("#messageContainer").html("<p class='textCenter red'><strong>" + message + "</strong></p>");
	if (!$("#messageContainer").is(":visible")) {
		$("#messageContainer").hide();
		$("#messageContainer").show("slow");
	}

	// If a show time was given, wait for the given time then hide the message
	if (showTime) {
		$("#messageContainer").delay(showTime).hide("slow");
	}
}

function showResultContainer() {
	$("#resultsContainer").hide();
	$("#resultsContainer").show("fast");
	$("#messageContainer").hide();
	$("#formContainer").hide("fast");

	$("#buttonContainer").html("<a href='javascript:returnToUploader()' class='button'>Return</a><br /><br />");
}


function displayDocumentStats(stats) {
	showMessage("Generating display...");
	
	var statTable = "<table style='margin: 0 auto'><tr><th>Word Count</th><th>Sentence Count</th><th>Line Count</th>" +
		"<th>Paragraph Count</th><th>Average Sentence Length</th><th>Average Paragraph Length</th></tr>" +
		"<tr><td>" + stats.wordCount + "</td><td>" + stats.sentenceCount + "</td><td>" + stats.lineCount + "</td><td>" +
		stats.getParagraphCount() + "</td><td>" + roundNumber(stats.averageSentenceLength, 2) + "</td><td>" +
		roundNumber(stats.getAverageParagraphLength(), 2) + "</td><td></tr></table>";
	

	var topWordsTable = "<table class='topTable'><tr><th colspan='3'><span class='top1 text_center'>" +
		"Top 10 Words</span></th></tr><tr><th>Word</th><th>Frequency</th><th>Relative Frequency</th></tr>";
	var topWords = stats.getMostSaidWords(10);
	for (var i in topWords) {
		if (i >= 0 && i <= 2) { // large size fonts for top 3
			topWordsTable += "<tr><td><span class='top" + i + "'>" + topWords[i][0] +
				"</span></td><td><span class='top" + i + "'>" + topWords[i][1] + "</span></td>" +
				"<td>" + roundNumber(topWords[i][2], 2) + "</td></tr>";
		} else {
			topWordsTable += "<tr><td>" + topWords[i][0] + "</td><td>" + topWords[i][1] + "</td>" +
				"<td>" + roundNumber(topWords[i][2], 2) + "</td></tr>";
		}
	}
	topWordsTable += "</table>";

	var punctuationTable = "<table class='topTable'><tr><th colspan='3'><span class='top1 text_center'>" +
		"Punctuation</span></th></tr><tr><th>Punctuation</th><th>Frequency</th></tr>";
	var characters = [ ".", ",", ";", ":", "?", "!", "\'", "\"", "-" ];
	for (var i in characters) {
		var ch = characters[i];
		punctuationTable += "<tr><td>" + ch + "</td><td>" + stats.numberOf(ch) + "</td></tr>";
	}
	punctuationTable += "</table>";

	// TODO: IE is centering tables within tables vertically, STOP THIS FROM HAPPENING!
	var tableOfTables = "<table width'650px'><tr><td>" + topWordsTable + "</td><td>" +
		punctuationTable + "</td></tr></table>";

	$("#resultsContainer").html("<div>" + statTable + "</div><div id='areaGraphContainer'></div>" +
		"<div>" + tableOfTables + "</div>");
	createAreaGraph("areaGraphContainer", "Document Trends", "Number of characters",
		function() { return "Paragraph " + this.x + " has " + this.y + " characters" },
		[{ name : "Paragraph Length", data : stats.paragraphLengths }]);

	showResultContainer();
}


function displayChatlogStats(stats) {
	showMessage("Generating display...");

	// Now interpret them and show them
	var statTable =  "<table style='margin: 0 auto'><tr><th>Participant</th>" +
	"<th>Percent of Messages</th><th>Number of Messages</th><th>Average Message " +
	"Length</th><th>Average Message Density</th><th>Word Count</th></tr>";
	var pieChartData = [ ];

	for (var name in stats.participants) {
		var participant = stats.participants[name];

		statTable += "<tr><td>" + name + "</td><td>" + roundNumber(participant.percentOfMessages, 2) +
			"%</td><td>" + participant.getMessageCount() + "</td><td>" + roundNumber(participant.getAverageMessageLength(), 2) +
			"</td><td>" + roundNumber(participant.getAverageMessageDensity(), 2) + "</td><td>" + participant.getWordCount() + "</tr>";
		pieChartData.push([name, participant.percentOfMessages]);
	}

	statTable += "</table>";

	// Generates tables to show the top 10 words for each participant
	var topWordTables = [];
	for (var name in stats.participants) {
		var current = "<table class='topTable'><tr><th colspan='3'><span class='top1 text_center'>" + name +
			"'s Top 10 Words</span></th></tr><tr><th>Word</th><th>Frequency</th><th>Relative Frequency</th></tr>";

		var topWords = stats.participants[name].getMostSaidWords(10);
		for (var i in topWords) {
			if (i >= 0 && i <= 2) { // large size fonts for top 3
				current += "<tr><td><span class='top" + i + "'>" + topWords[i][0] +
					"</span></td><td><span class='top" + i + "'>" + topWords[i][1] + "</span></td>" +
					"<td>" + roundNumber(topWords[i][2], 2) + "</td></tr>";
			} else {
				current += "<tr><td>" + topWords[i][0] + "</td><td>" + topWords[i][1] + "</td>" +
					"<td>" + roundNumber(topWords[i][2], 2) + "</td></tr>";
			}
		}
		current += "</table>";

		topWordTables.push(current);
	}
	var tableOfTables = "<table width='650px'>";
	for (var i in topWordTables) {
		if (i % 2 == 0) {
			tableOfTables += "<tr><td>" + topWordTables[i] + "</td>";
		} else {
			tableOfTables += "<td>" + topWordTables[i] + "</td></tr>";
		}
	}
	tableOfTables += "</table>"

	// Show tables/graphs from the results
	$("#resultsContainer").html("<div>" + statTable + "</div><div id='pieChartContainer'></div><div>" + tableOfTables + "</div>");
	createPieChart("pieChartContainer", "Message Contribution", pieChartData);

	showResultContainer();
}


function displayHTMLStats(stats) {
	showMessage("Generating display...");

	var lineTable = "<table style='margin: 0 auto'><tr><th colspan='4'>" +
		"<span class='top1 text_center'>Lines</span></th></tr>" +
		"<tr><th>Code</th><th>Comments</th><th>Whitespace</th><th>Total</th></tr>" +
		"<tr><td>" + stats.codeLines + "</td><td>" + stats.commentCount + "</td><td>" +
		stats.whitespaceLines + "</td><td>" + stats.totalLines + "</td></tr></table>";
	var htmlTable = "<table style='margin: 0 auto'><tr><th colspan='5'>" +
		"<span class='top1 text_center'>HTML</span></th></tr>" +
		"<tr><th>Tags</th><th>Links</th><th>Images</th><th>Frames</th><th>Embedded Objects</th></tr>" +
		"<tr><td>" + stats.tagCount + "</td><td>" + stats.linkCount + "</td><td>" +
		stats.imageCount + "</td><td>" + stats.frameCount + "</td><td>" + stats.objectCount + "</td></tr></table>";
	var cssTable = "<table style='margin: 0 auto'><tr><th colspan='3'>" +
		"<span class='top1 text_center'>CSS</span></th></tr>" +
		"<tr><th>IDs</th><th>Classes</th><th>Inline Styles</th></tr><tr><td>" +
		stats.cssIDCount + "</td><td>" + stats.cssClassCount + "</td><td>" + stats.inlineStyleCount + "</td></tr></table>";
	var resourceTable = "<table style='margin: 0 auto'><tr><th colspan='4'>" +
		"<span class='top1 text_center'>Resources</span></th></tr>" +
		"<tr><th>Ext. Stylesheets</th><th>Int. Stylesheets</th><th>Ext. Scripts</th><th>Int. Scripts</th></tr>" +
		"<tr><td>" + stats.extStylesheetCount + "</td><td>" + stats.intStylesheetCount + "</td><td>" +
		 stats.extScriptCount + "</td><td>" + stats.intScriptCount + "</td></tr></table>"

	var topTagTable = "<table><tr><th colspan='3'><span class='top1 text_center'>Top 10 Tags</span></th></tr>" +
		"<tr><th>Tag</th><th>Frequency</th><th>Relative Frequency</th></tr>";
	var topTags = stats.getMostUsedTags(10);
	for (var i in topTags) {
		topTagTable += "<tr><td>" + topTags[i][0] + "</td><td>" + topTags[i][1] + "</td><td>"
			+ roundNumber(topTags[i][2], 2) + "</td></tr>";
	}
	topTagTable += "</table>";

	var topStyleTable = "<table><tr><th colspan='3'><span class='top1 text_center'>Top 10 IDs/Classes</span></th></tr>" +
		"<tr><th>Tag</th><th>Frequency</th><th>Relative Frequency</th></tr>";
	var topStyles = stats.getMostUsedStyles(10);
	for (var i in topStyles) {
		topStyleTable += "<tr><td>" + topStyles[i][0] + "</td><td>" + topStyles[i][1] + "</td><td>"
			+ roundedNumber(topStyles[i][2], 2) + "</td></tr>";
	}
	topStyleTable += "</table>";

	var topTables = "<table><tr><td>" + topTagTable + "</td><td>" + topStyleTable + "</td></tr></table>";

	$("#resultsContainer").html(lineTable + htmlTable + cssTable + resourceTable + topTables);

	showResultContainer();	
}
