// Maps the index of the selected language to its name
var indexToLanguage = {
	0 : "english",
	1 : "french",
	2 : "german",
	3 : "italian",
	4 : "spanish",
	5 : "portuguese",
	6 : "swedish",
	7 : "finnish"
}
// Global variables for this page, store what feature and language have been selected
var selectedFeature = 0
var selectedLanguage = 0;
var selectedProgLanguage = 0;

/* Retrives text from the raw text area. */
function getText() {
	var rawText = document.forms["logForm"].elements["rawText"];
	return rawText.value;
}

/* Sets the content of the raw text area. */
function setText(text) {
	var rawText = document.forms["logForm"].elements["rawText"];
	rawText.value = text;
}

/* Puts example content that's relevant to the currently selected
 * feature/language into text area. */
function showExample() {
	if (selectedFeature == 0 || selectedFeature == 1)
		setText(EXAMPLES[selectedFeature][selectedLanguage]);
	else if (selectedFeature == 2)
		setText(EXAMPLES[selectedFeature][selectedProgLanguage]);
}

/* Called when the analyse button is clicked. */
function analyse() {
	// Get source text
	var text = getText();
	if (text != undefined && text != "") {
		if (!TaskQueue.instance.running) {
			switch (selectedFeature) {
				case 0: analyseDocument(text); break;
				case 1: analyseChatlog(text); break;
				case 2: analyseSourceFile(text); break;
			}
			$("#buttonContainer").html("<a href='javascript:cancelAnalysis()' class='button'>Cancel</a><br /><br />");
		}
	} else {
		showMessage("No text provided.", 4000);
	}
}

function analyseDocument(text) {
	// Creates objects to clean up the text based on the selected language
	var language = indexToLanguage[selectedLanguage];
	var sanitiser = new Sanitiser(language);
	var stemmerObject = new Stemmer(sanitiser, language);
	var stoplist = new Stoplist(STOP_LISTS[language]);

	TaskQueue.instance.add(new DocumentStatistics(text, stemmerObject, stoplist, showMessage));
	TaskQueue.instance.add(new FunctionWrapper(displayDocumentStats));
	TaskQueue.instance.start();
}

function analyseChatlog(text) {
	var language = indexToLanguage[selectedLanguage];
	var sanitiser = new Sanitiser(language);
	var stemmerObject = new Stemmer(sanitiser, language);
	var stoplist = new Stoplist(STOP_LISTS[language]);

	TaskQueue.instance.add(new LogProcessor(text, stemmerObject, stoplist, showMessage));
	TaskQueue.instance.add(new ChatStatistics(showMessage));
	TaskQueue.instance.add(new FunctionWrapper(displayChatlogStats));
	TaskQueue.instance.start();	
}

function analyseSourceFile(text) {
	switch (selectedProgLanguage) {
	case 0:
		TaskQueue.instance.add(new HTMLStatistics(text, showMessage));
		TaskQueue.instance.add(new FunctionWrapper(displayHTMLStats));
		break;
	case 1:
		TaskQueue.instance.add(new JSStatistics(text, showMessage));
		TaskQueue.instance.add(new FunctionWrapper(displayJSStats));
		break;
	case 2:
		TaskQueue.instance.add(new JavaStatistics(text, showMessage));
		TaskQueue.instance.add(new FunctionWrapper(displayJavaStats));
		break;
	case 3:
		TaskQueue.instance.add(new CSStatistics(text, showMessage));
		TaskQueue.instance.add(new FunctionWrapper(displayCSStats));
		break;
	case 4:
		TaskQueue.instance.add(new CPPStatistics(text, showMessage));
		TaskQueue.instance.add(new FunctionWrapper(displayCPPStats));
		break;
	}
	TaskQueue.instance.start();
}

function cancelAnalysis() {
	TaskQueue.instance.stop();

	$("#buttonContainer").html(
		"<a href='javascript:analyse()'' class='button'>Analyse</a><br /><br />");
	// Hides message container then clears its content
	$("#messageContainer").hide("fast").html("");
}

function returnToUploader() {
	$("#resultsContainer").hide("fast");
	$("#messageContainer").hide();
	$("#buttonContainer").html("<a href='javascript:analyse()'' class='button'>Analyse</a><br /><br />");
	
	$("#formContainer").show("fast");
}

function setFeature(index) {
	previousFeature = selectedFeature;
	selectedFeature = index;
	$("#featureID" + previousFeature).removeClass("selected");
	$("#featureID" + selectedFeature).addClass("selected");

	// Now shows the appropriate form
	if (selectedFeature == 0 || selectedFeature == 1) {
		if (previousFeature != 0 && previousFeature != 1) {
			$("#options1").hide("fast");
			$("#options0").show("fast");
		}
	} else if (selectedFeature == 2) {
		if (previousFeature != 2) {
			$("#options0").hide("fast");
			$("#options1").show("fast");
		}
	}
}

function setLanguage(index) {
	$("#languageID" + selectedLanguage).removeClass("selected");
	selectedLanguage = index;
	$("#languageID" + selectedLanguage).addClass("selected");
}

function setProgLanguage(index) {
	$("#progLanguageID" + selectedProgLanguage).removeClass("selected");
	selectedProgLanguage = index;
	$("#progLanguageID" + selectedProgLanguage).addClass("selected");
}
