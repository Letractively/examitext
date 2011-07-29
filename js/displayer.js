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

function generateTable(title, headings, data, tooltips) {
	var table = "<table style='margin: 0 auto'>";
	if (title && title != "") {
		table += "<tr><th colspan='" + headings.length + "'><span class='top1 text_center'>" + title + "</span.</th></tr><tr>";
	}

	table += "<tr>";
	if (tooltips) {
		for (var i = 0; (i < headings.length); ++i) {
			table += "<th class='tooltip' title='" + tooltips[i] + "'>" + headings[i] + "</th>";
		}
	} else { // don't add titles if tooltips weren't provided
		for (var i = 0; (i < headings.length); ++i) {
			table += "<th>" + headings[i] + "</th>";
		}
	}
	table += "</tr><tr>";
	for (var i = 0; (i < data.length); ++i) {
		table += "<td>" + data[i] + "</td>";
	}
	table += "</tr></table>";
	return table;
}

function generateComplexity(complexity) {
	return "<div class='header center'>Highest Quadratic Time Complexity Detected<br /><br />" +
		"<span style='color: #000; font-weight: normal;'>" + complexity + "</span></span></div>";
}

/* Generates a hierarchial view of the classes and their inheritences.
 * 'nodes' is an instance of ClassNode, which represents the root of
 * the class hierarchy.
 * 'depth' is an optional parameter that is 0 when not provided. Only the
 * first parameter is to be provided on the initial call of this function. */
function generateClassHierarchy(node, depth) {
	var depth = depth || 0;
	var markup = "";

	if (depth == 0) markup += "<ul>";
	markup += "<li class='hierarchyNode tooltip' title='" + node.description + "'><span>" + node.name + "<span></li>";

	markup += "<ul>";
	for (var name in node.children) {
		markup += generateClassHierarchy(node.children[name], depth + 1)
	}
	markup += "</ul>";

	if (depth == 0) markup += "</ul>";

	return markup;
}

function displayDocumentStats(stats) {
	showMessage("Generating display...");
	
	var statTable = generateTable("Statistics",
		["Words", "Sentences", "Lines", "Paragraphs", "Average Sentence Length", "Average Paragraph Length"],
		[stats.wordCount, stats.sentenceCount, stats.lineCount, stats.getParagraphCount(),
		roundNumber(stats.averageSentenceLength, 2), roundNumber(stats.getAverageParagraphLength(), 2)],
		["Total number of words in the document.", "Total number of sentences in the document.",
		 "Number of lines in the documemnt.", "Total number of paragraphs in the document.",
		 "Length of an average sentence in the document.", "Length of an average paragraph in the document."]);

	var topWordsTable = "<table class='topTable'><tr><th colspan='3'>" +
		"<span class='top1 text_center tooltip' title='10 most frequently occuring words (after stemming" +
		" and filtering out common words).'>Top 10 Words</span></th></tr><tr><th>Word</th><th>Frequency</th>" +
		"<th>Relative Frequency</th></tr>";
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

	var punctuationTable = "<table class='topTable'><tr><th colspan='3'><span class='top1 text_center tooltip'" +
		"title='Amount of time each punctuation mark occurred.'>Punctuation</span></th></tr>" +
		"<tr><th>Punctuation</th><th>Frequency</th></tr>";
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
	var statTable =  "<table style='margin: 0 auto'><tr>" +
	"<th class='tooltip' title='Name of each participant.'>Participant</th>" +
	"<th class='tooltip' title='Percent of the total messages that were contributed by each participant.'>Percent of Messages</th>" +
	"<th class='tooltip' title='Total number of messages each participant made.'>Number of Messages</th>" +
	"<th class='tooltip' title=\"Each participant's average message length (in characters).\">Average Message Length</th>" +
	"<th class='tooltip' title='The average number of consecutive messages sent by each participant.'>Average Message Density</th>" +
	"<th class='tooltip' title='Total number of words sent by each participant (after stemming and filtering out common words).'>Word Count</th></tr>";
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
		var current = "<table class='topTable'><tr><th colspan='3'><span class='top1 text_center tooltip'" + 
			"title=\"" + name + "'s top 10 most frequently said words.\">" + name +
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

	var lineTable = generateTable("Lines", ["Code", "Comments", "Whitespace", "Total"],
		[stats.codeLines, stats.commentLines, stats.whitespaceLines, stats.totalLines]);
	var htmlTable = generateTable("HTML", ["Tags", "Links", "Images", "Frames", "Embedded Objects"],
		[stats.tagCount, stats.linkCount, stats.imageCount, stats.frameCount, stats.objectCount]);
	var cssTable = generateTable("CSS", ["IDs", "Classes", "Inline Styles"],
		[stats.cssIDCount, stats.cssClassCount, stats.inlineStyleCount]);
	var resourceTable = generateTable("Resources", ["Ext. Stylesheets", "Int. Stylesheets",
		"Ext. Scripts", "Int. Scripts"], [stats.extStylesheetCount, stats.intStylesheetCount,
		stats.extScriptCount, stats.intScriptCount]);

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
			+ roundNumber(topStyles[i][2], 2) + "</td></tr>";
	}
	topStyleTable += "</table>";

	var topTables = "<table><tr><td>" + topTagTable + "</td><td>" + topStyleTable + "</td></tr></table>";

	$("#resultsContainer").html(lineTable + htmlTable + cssTable + resourceTable + topTables);
	showResultContainer();
	// Also display an error message if the stats object has signalled that one occurred
	if (stats.error) {
		showMessage("There was an error parsing the HTML file. As such, the displayed results may not be correct.");
	}
}

// General language stats for all languages (excluding HTML)
function displayProgLanguageStats(stats) {
	showMessage("Generating display...");

	var lineTable = generateTable("Lines", ["Code", "Comments", "Whitespace", "Total"],
		[stats.codeLines, stats.commentLines, stats.whitespaceLines, stats.totalLines]);
	var opsTable = generateTable("Basic Operations",
		["+ / +=", "- / -=", "* / *=", "/ / /=", "^ / ^=", "% / %="], [
		stats.basicOperations["+"] + " / " + stats.basicOperations["+="],
		stats.basicOperations["-"] + " / " + stats.basicOperations["-="],
		stats.basicOperations["*"] + " / " + stats.basicOperations["*="],
		stats.basicOperations["/"] + " / " + stats.basicOperations["/="],
		stats.basicOperations["^"] + " / " + stats.basicOperations["^="],
		stats.basicOperations["%"] + " / " + stats.basicOperations["%="]]);
	var compTable = generateTable("Comparison Operations",
		["==", "<=", ">=", "<", ">", "&&", "||"], [
		stats.basicOperations["=="], stats.basicOperations["<="],
		stats.basicOperations[">="], stats.basicOperations["<"],
		stats.basicOperations[">"], stats.basicOperations["&&"],
		stats.basicOperations["||"]]);
	var otherTable = generateTable("Other Operations",
		["=", "&", "|", "~"], [stats.basicOperations["="], stats.basicOperations["&"],
		stats.basicOperations["|"], stats.basicOperations["~"]]);
	var ctrlStructTable = generateTable("Control Structures",
		["if", "else", "switch", "case", "for", "while"],
		[stats.controlStructures["if"], stats.controlStructures["else"],
		stats.controlStructures["switch"], stats.controlStructures["case"],
		stats.controlStructures["for"], stats.controlStructures["while"]]);

	return (lineTable + opsTable + compTable + otherTable + ctrlStructTable);
}

function displayJSStats(stats) {
	var generalStats = displayProgLanguageStats(stats);

	var symbolsTable = generateTable("Symbols",
		["Functions", "Variables",],
		[ stats.functionCount, stats.variableCount ]);

	var topFunctions = stats.getMostUsedFunctions(5);
	var topVariables = stats.getMostUsedVariables(5);

	var topFunctionTable = "<table><tr><th colspan='2'><span class='top1 text_center'>Top 5 Functions</span></th></tr>" +
		"<tr><th>Name</th><th>Frequency</th></tr>";
	for (var i in topFunctions) {
		topFunctionTable += "<tr><td>" + topFunctions[i][0] + "</td><td>" + topFunctions[i][1] + "</td></tr>";
	}
	topFunctionTable += "</table>";

	var topVariableTable = "<table><tr><th colspan='2'><span class='top1 text_center'>Top 5 Variables</span></th></tr>" +
		"<tr><th>Name</th><th>Frequency</th></tr>";
	for (var i in topVariables) {
		topVariableTable += "<tr><td>" + topVariables[i][0] + "</td><td>" + topVariables[i][1] + "</td></tr>";
	}
	topVariableTable += "</table>";

	var topTables = "<table style='margin: 0 auto'><tr><td>" + topFunctionTable + "</td><td>" +
		topVariableTable + "</td></tr></table>";	

	$("#resultsContainer").html(generalStats + symbolsTable + topTables + generateComplexity(stats.getHighestComplexity()));
	showResultContainer();
}

function displayJavaStats(stats) {
	var generalStats = displayProgLanguageStats(stats);

	var symbolsTable = generateTable("Symbols",
		["Classes/Interfaces", "Total Methods", "Total Properties"],
		[ stats.getClassCount(), stats.getTotalMethods(), stats.getTotalProperties() ]);
	var miscTable = generateTable("Miscellaneous", ["New Allocations"], [stats.objectCreationCount]);

	var classTree = "<div class='classHierarchy' style='padding-left: 10px'>Class Hierarchy</div>" + 
		"<div style='position: relative; left: 30px;'>" + generateClassHierarchy(stats.getClassTree()) + "</div>";

	$("#resultsContainer").html(generalStats + symbolsTable + miscTable +
		generateComplexity(stats.getHighestComplexity()) + classTree);
	showResultContainer();
}

function displayCSStats(stats) {
	var generalStats = displayProgLanguageStats(stats);

	var symbolsTable = generateTable("Symbols",
		["Classes/Structs/Interfaces", "Total Methods", "Total Properties"],
		[ stats.getClassCount(), stats.getTotalMethods(), stats.getTotalProperties() ]);
	var miscTable = generateTable("Miscellaneous", ["'New' Allocations"], [stats.objectCreationCount]);

	var classTree = "<div class='classHierarchy' style='padding-left: 10px'>Class Hierarchy</div>" + 
		"<div style='position: relative; left: 30px;'>" + generateClassHierarchy(stats.getClassTree()) + "</div>";

	$("#resultsContainer").html(generalStats + symbolsTable + miscTable + 
		generateComplexity(stats.getHighestComplexity()) + classTree);
	showResultContainer();
}

function displayCPPStats(stats) {
	var generalStats = displayProgLanguageStats(stats);

	var symbolsTable = generateTable("Symbols",
		["Function/Function Calls", "Global/Local Variables", "Classes/Structs", "Total Methods", "Total Properties"],
		[ stats.functionCount, stats.variableCount, stats.getClassCount(), stats.getTotalMethods(),
		stats.getTotalProperties() ]);
	var miscTable = generateTable("Miscellaneous", ["'New' Allocations"], [stats.objectCreationCount]);

	var classTree = "<div class='classHierarchy'>Class Hierarchy</div>" + 
		"<div style='position: relative; left: 30px;'>" + generateClassHierarchy(stats.getClassTree()) + "</div>";

	$("#resultsContainer").html(generalStats + symbolsTable + miscTable +
		generateComplexity(stats.getHighestComplexity()) + classTree);
	showResultContainer();
}



/* Useful for dynamically placing elements at the centre of the screen. */
jQuery.fn.center_screen_x = function() {
	this.css("position","absolute");
	this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
}
jQuery.fn.center_screen_y = function() {
	this.css("position","absolute");
	this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
}
jQuery.fn.center_screen = function() {
	this.center_screen_x();
	this.center_screen_y();
    return this;
}