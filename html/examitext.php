<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
	<title>Examitext</title>

	<!-- External libraries -->
	<script type="text/javascript" src="../js/jquery-1.6.2.js"></script>
	<script type="text/javascript" src="../js/highcharts.js"></script>
	<script type="text/javascript" src="../js/snowball.js"></script>
	<script type="text/javascript" src="../js/htmlparser.js"></script>
	<script type="text/javascript" src="../js/split.js"></script>
	<script type="text/javascript" src="../js/easytooltip.js"></script>

	<!-- Examitext Files -->
	<script type="text/javascript" src="../js/highcharts_wrapper.js"></script>

	<script type="text/javascript" src="../js/util.js"></script>
	<script type="text/javascript" src="../js/taskqueue.js"></script>

	<script type="text/javascript" src="../js/sanitiser.js"></script>
	<script type="text/javascript" src="../js/stemmer.js"></script>
	<script type="text/javascript" src="../js/stoplist.js"></script>
	<script type="text/javascript" src="../js/document_processor.js"></script>
	<script type="text/javascript" src="../js/log_processor.js"></script>

	<script type="text/javascript" src="../js/tokeniser.js"></script>
	<script type="text/javascript" src="../js/code_processor.js"></script>

	<script type="text/javascript" src="../js/displayer.js"></script>
	<script type="text/javascript" src="../js/menu.js"></script>
	<script type="text/javascript" src="../js/examples.js"></script>

	<link rel="stylesheet" type="text/css" href="../css/reset.css" />
	<link rel="stylesheet" type="text/css" href="../css/style.css" />

</head>

<body>

	<div id="container">
		<div id="header">
			<img src="../images/header.png" alt="Examitext" />
		</div>

		<div id="content">

			<div id="formContainer">
				<div class="featurePadding"></div>
				<a id="featureID0" class="feature selected" href="javascript:setFeature(0)">
				<img src="../images/text_file.png" alt="Text Document" /></a>
				<a id="featureID1" class="feature" href="javascript:setFeature(1)">
				<img src="../images/chat_log.png" alt="Chat Log" /></a>
				<a id="featureID2" class="feature" href="javascript:setFeature(2)">
				<img src="../images/source_file.png" alt="Source File" /></a>
				<div class="featurePadding"></div>

				<!-- Done for Firefox compatibility. -->
				<div style="clear: both;"></div>

				<form id="logForm" action="examitext.php" method="post" enctype="multipart/form-data">

					<table>
						<!-- Used to tell PHP code whether user is uploading file from their
						     computer or downloading one from another website. -->
						<input name="task" value="none" type="hidden" />
						<tr>
							<td>
								<strong>Upload File:</strong><span style="padding-left: 30px"></span>
								<input name="localFile" type="file" /><span style="padding-left: 10px"></span>
							</td>
							<td>
								<button onclick="uploadFile()" class="tooltip"
									title="Upload a file from your computer!"> Upload</button>
							</td>
						</tr>
						<tr>
							<td>
								<strong>URL:</strong><span style="padding-left: 78px"></span>
								<input name="url" type="text" class="textbox" size="60" /><span style="padding-left: 92px"></span>
							</td>
							<td>
								<button onclick="downloadFile()" class="tooltip" title="Download a file from a remote URL!">Download</button>
							</td>
						</tr>
						<tr><td colspan="2">
							<span style="float: left"><strong>Raw text:</strong></span>
							<span style="float: right"><a href="javascript:showExample()" class="tooltip"
							title="Click this to load some example text, so you can see how it works!">
							Show Example</a></span>
							<div style="clear: both"></div>
						</td></tr>
						<tr><td colspan="2">
							<textarea id="rawText" rows="15" cols="150" colspan="3"></textarea>
						</td></tr>
						<tr><td><strong>Language of text:</strong></td></tr>
					</table>
				</form>

				<div id="options0">
					<div class="flagPadding"></div>
					<a id="languageID0" class="language selected tooltip" href="javascript:setLanguage(0)" title="English">
					<img src="../images/flags/uk.png" alt="English" /></a>
					<a id="languageID1" class="language tooltip" href="javascript:setLanguage(1)" title="Fran&#231;ais">
					<img src="../images/flags/fr.png" alt="Fran&#231;ais" /></a>
					<a id="languageID2" class="language tooltip" href="javascript:setLanguage(2)" title="Deutsch">
					<img src="../images/flags/de.png" alt="Deutsch" /></a>
					<a id="languageID3" class="language tooltip" href="javascript:setLanguage(3)" title="Italiano">
					<img src="../images/flags/it.png" alt="Italiano" /></a>
					<a id="languageID4" class="language tooltip" href="javascript:setLanguage(4)" title="Espa&#241;ol">
					<img src="../images/flags/es.png" alt="Espa&#241;ol" /></a>
					<a id="languageID5" class="language tooltip" href="javascript:setLanguage(5)" title="Portugu&#234;s">
					<img src="../images/flags/pt.png" alt="Portugu&#234;s" /></a>
					<a id="languageID6" class="language tooltip" href="javascript:setLanguage(6)" title="Svenska">
					<img src="../images/flags/se.png" alt="Svenska" /></a>
					<a id="languageID7" class="language tooltip" href="javascript:setLanguage(7)" title="Suomi">
					<img src="../images/flags/fi.png" alt="Suomi" /></a>
					<div class="flagPadding"></div>
				</div>
				<div id="options1">
					<div class="progLanguagePadding"></div>
					<a id="progLanguageID0" class="language selected tooltip" href="javascript:setProgLanguage(0)" title="HTML">
					<img src="../images/proglanguages/html.png" alt="HTML" /></a>
					<a id="progLanguageID1" class="language tooltip" href="javascript:setProgLanguage(1)" title="JavaScript">
					<img src="../images/proglanguages/js.png" alt="JavaScript" /></a>
					<a id="progLanguageID2" class="language tooltip" href="javascript:setProgLanguage(2)" title="Java">
					<img src="../images/proglanguages/java.png" alt="Java" /></a>
					<a id="progLanguageID3" class="language tooltip" href="javascript:setProgLanguage(3)" title="C#">
					<img src="../images/proglanguages/cs.png" alt="C#" /></a>
					<a id="progLanguageID4" class="language tooltip" href="javascript:setProgLanguage(4)" title="C++">
					<img src="../images/proglanguages/cpp.png" alt="C++" /></a>
					<div class="progLanguagePadding"></div>
				</div>
			</div>

			<!-- Contains messages (typically error messages) to show to the user. -->
			<div id="messageContainer"></div>

			<div style="padding-top: 20px"></div>

			<!-- Empty at the moment, just here so the divs are created. -->
			<div id="resultsContainer"></div>

			<div id="buttonContainer">
				<a href="javascript:analyse()" class="button">Analyse</a>
				<br />
				<br />
			</div>
		</div>

		<div id="footer">
			<p>Copyright 2011 Donald Whyte</p>
		</div>
	</div>

	<?php
	$fullText = "";
	$errorMessage = "";

	if (isset($_POST['task'])) {
		$success = false;
		
		if ($_POST['task'] == "file") {
			if ($_FILES['localFile']['error'] === UPLOAD_ERR_OK) {
				$file = fopen($_FILES['localFile']['tmp_name'], "r");
				if (!$file) $errorMessage = "Could not read uploaded file.";
				else $success = true;
			} else {
				$errorMessage = "File was not uploaded correctly.";
			}

		} else if ($_POST['task'] == "url") {
			if ($_POST['url'] == "") {
				$errorMessage = "No URL given.";
			} else {
				$file = fopen($_POST['url'], "rb");
				if (!$file)
					$errorMessage = "Unable to read file at $_POST[url].";
				else
					$success = true;
			}
		}

		if ($success) {
			// Reads all of the file in as text
			$lines = array();
			while (!feof($file)) {
				array_push($lines, fgets($file, 1024));
			}

			fclose($file);

			// Joins up all the lines with a line separator and sends
			// the text to JavaScript
			$fullText = implode("\n", $lines);
		}
	}
	?>

	<!-- We center the container here since it's been populated with all
	     its content by this point. -->
	<script type="text/javascript">
		$("#container").center_screen();
		$("#messageContainer").hide();
		$("#options1").hide();

		generateTooltips();

		/* Called whenever the user tries to upload/download a file to the application */
		function uploadFile() {
			var form = document.forms[0];
			form.elements["task"].value = "file";

			saveMenuState(form);
			form.submit();
		}

		function downloadFile() {
			var form = document.forms[0];
			form.elements["task"].value = "url";

			saveMenuState(form);
			form.submit();
		}

		/* Adds new hidden fields to the form so the state of the menu
		 * (what feature/language is selected) is preserved when the page
		 * is refereshed. */
		function saveMenuState(form) {
			$("#logForm").append(
				"<input type='hidden' name='featureSelected' value='" + selectedFeature + "' />" +
				"<input type='hidden' name='languageSelected' value='" + selectedLanguage + "' />" +
				"<input type='hidden' name='progLanguageSelected' value='" + selectedProgLanguage + "' />"
			);
		}

		// Checks if there's some text that's been uploaded/download
		// and places it in the raw text area
		var fullText = <?php echo json_encode($fullText); ?>;
		setText(fullText);

		<?php
		if ($errorMessage) {
			$encoded = json_encode($errorMessage);
			echo "showMessage($encoded, 3000); ";
		}
		if (isset($_POST["featureSelected"])) {
			$index = $_POST["featureSelected"];
			echo "setFeature($index); ";
		}
		if (isset($_POST["languageSelected"])) {
			$index = $_POST["languageSelected"];
			echo "setLanguage($index); ";
		}
		if (isset($_POST["progLanguageSelected"])) {
			$index = $_POST["progLanguageSelected"];
			echo "setProgLanguage($index); ";
		}
		?>
	</script>

</body>

</html>
