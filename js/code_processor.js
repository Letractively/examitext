/* ---------------------------------------------------------- */
/*                            HTML                            */
/* ---------------------------------------------------------- */

function HTMLStatistics(text, sendMessage) {
	this.text = text;
	this.sendMessage = sendMessage;
	this.stage = 0;

	this.totalLines = 0;
	this.whitespaceLines = 0;
	this.commentLines = 0;
	this.codeLines = 0;

	this.tagCount = 0;
	this.linkCount = 0;
	this.imageCount = 0;
	this.frameCount = 0;
	this.objectCount = 0;

	this.totalStyleCount = 0;
	this.cssIDCount = 0;
	this.cssClassCount = 0;
	this.inlineStyleCount = 0;

	this.extStylesheetCount = 0;
	this.intStylesheetCount = 0;
	this.extScriptCount = 0;
	this.intScriptCount = 0;

	this.tagFrequencies = {};
	this.relativeTagFrequencies = {};
	// NOTE: style means classes, IDs AND inline styles in this case
	this.styleFrequencies = {};
	this.relativeStyleFrequencies = {};
}

HTMLStatistics.prototype.run = function(value) {
	switch (this.stage) {
	case 0: // main parsing
		this.sendMessage("Parsing HTML...");

		try {
			var stats = this;
			HTMLParser(this.text, {
				start: function(tag, attrs, unary) {
					// Tag counting
					stats.tagCount += 1;
					if (tag in stats.tagFrequencies) {
						stats.tagFrequencies[tag] += 1;
					} else {
						stats.tagFrequencies[tag] = 1;
					}

					// Resource counting
					if (tag == "style") {
						stats.intStylesheetCount += 1;
					} else if (tag == "link") {
						// If it's got the rel attribute it says stylesheet, assume external stylesheet
						for (var i in attrs) {
							if (attrs[i].name == "rel" && attrs[i].escaped == "stylesheet") {
								stats.extStylesheetCount += 1;
								break;
							}
						}
					} else if (tag == "script") {
						var hasSrc = false;
						for (var i in attrs) {
							if (attrs[i].name == "src") {
								stats.extScriptCount += 1;
								hasSrc = true;
								break;
							}
						}
						// If <script> doesn't have a src attribute, just assume there's an internal script
						if (!hasSrc) stats.intScriptCount += 1;
					}

					// Style counting
					for (var i in attrs) {
						// Tries to find style
						var style = "";
						if (attrs[i].name == "id") {
							style = "#" + attrs[i].escaped;
						} else if (attrs[i].name == "class") {
							style = "." + attrs[i].escaped;
						} else if (attrs[i].name == "style") {
							style = "inline: { " + attrs[i].escaped + " }";
						}
						// If one was found, add it
						if (style != "") {
							if (style in stats.styleFrequencies) {
								stats.styleFrequencies[style] += 1;
							} else {
								// Since this is a new style, update the counters!
								if (style.charAt(0) == "#") stats.cssIDCount += 1;
								else if (style.charAt(0) == ".") stats.cssClassCount += 1;
								else if (style.substring(0, 6) == "inline") stats.inlineStyleCount += 1;

								stats.styleFrequencies[style] = 1;
							}
						}
					}
				},

				comment: function(text) {
					stats.commentLines += text.split("\n").length;
				}

			});
		} catch (err) {
			// Error parsing text, set error flag to true
			this.error = true;
		}

		// Calculates how many of each type of line there are (except for
		// comment lines, which are calculated in the HTML Parser
		var lines = this.text.split("\n");
		this.totalLines = lines.length;

		this.whitespaceLines = 0;
		for (var i in lines) {
			var matches = lines[i].match(/^\s*?$/);
			if (matches != null && matches.length > 0) {
				this.whitespaceLines += 1;
			}
		}

		this.codeLines = this.totalLines - this.whitespaceLines - this.commentLines;

		this.stage += 1;
		break;
	case 1: // relative frequency processing
		this.sendMessage("Calculating relative frequencies...");

		for (var tag in this.tagFrequencies) {
			this.relativeTagFrequencies[tag] = this.tagFrequencies[tag] / this.tagCount;
		}

		this.totalStyleCount = this.cssIDCount + this.cssClassCount + this.inlineStyleCount;
		for (var style in this.styleFrequencies) {
			this.relativeStyleFrequencies[style] = this.styleFrequencies[style] / this.totalStyleCount;
		}

		this.stage += 1;
		break;
	case 2: // tag processing (cont.)
		this.sendMessage("Counting tags...");

		this.linkCount = this.tagFrequencies["a"] || 0;
		this.imageCount = this.tagFrequencies["img"] || 0;
		this.frameCount = (this.tagFrequencies["frame"] || 0) + (this.tagFrequencies["iframe"] || 0);
		this.objectCount = this.tagFrequencies["object"] || 0;

		this.stage += 1;
		return this;
	}
}

HTMLStatistics.prototype.getMostUsedTags = function(amount) {
	var sortedTags = toSortedTuples(this.tagFrequencies);

	var topTags = [];
	var count = 0;
	for (var i in sortedTags) {
		topTags.push([ sortedTags[i][0], sortedTags[i][1],
			this.relativeTagFrequencies[sortedTags[i][0]] ]);

		count += 1;
		if (count >= amount) break;
	}
	return topTags;
}

HTMLStatistics.prototype.getMostUsedStyles = function(amount) {
	var sortedStyles = toSortedTuples(this.styleFrequencies);

	var topStyles = [];
	var count = 0;
	for (var i in sortedStyles) {
		topStyles.push([ sortedStyles[i][0], sortedStyles[i][1],
			this.relativeStyleFrequencies[sortedStyles[i][0]] ]);

		count += 1;
		if (count >= amount) break;
	}
	return topStyles;
}



/* ---------------------------------------------------------- */
/*                       General Language                     */
/* ---------------------------------------------------------- */

/* Assumes given argument is an object where all of its values
 * are numbers and returns the sum of those numbers. */
function getTotal(obj) {
	var total = 0;
	for (var prop in obj) {
		total += obj[prop];
	}
	return total;
}

/* Assumes 'obj' is an object where all of its values are
 * numbers and returns the top 'amount' highest of them. */
function getLargestValues(obj, amount) {
	var sortedValues = toSortedTuples(obj);

	var topValues = [];
	var count = 0;
	for (var i in sortedValues) {
		topValues.push([ sortedValues[i][0], sortedValues[i][1] ]);

		count += 1;
		if (count >= amount) break;
	}
	return topValues;
}

function LanguageStatistics(text, sendMessage) {
	this.text = text;
	this.sendMessage = sendMessage;
	this.stage = 0;
	
	this.tokens = [];

	this.totalLines = 0;
	this.commentLines = 0;
	this.whitespaceLines = 0;
	this.codeLines = 0;

	this.basicOperations = {
		"=": 0, "&": 0, "|": 0, "~": 0, // assignment and bit ops
		"+": 0, "-": 0, "*": 0, "/": 0, "^": 0, "%": 0,
		"+=": 0, "-=": 0, "*=": 0, "/=": 0, "^=": 0, "%=": 0,
		"==": 0, "<=": 0, ">=": 0, "<": 0, ">": 0, "&&": 0, "||": 0
	};
	this.controlStructures = {
		"if": 0, "else": 0, "switch": 0, "case": 0,
		"for": 0, "while": 0
	};

	this.deepestNestedLoop = 0;

	// Need to be filled by subclasses
	this.variables = {};
	this.functions = {};
	this.variableCount = 0;
	this.functionCount = 0;
}

LanguageStatistics.prototype.run = function(value) {
	switch (this.stage) {
	case 0: // line counts
		this.sendMessage("Calculating initial statistics...");

		var lines = this.text.split("\n");
		this.totalLines = lines.length;

		this.whitespaceLines = 0;
		for (var i in lines) {
			var matches = lines[i].match(/^\s*?$/);
			if (matches != null && matches.length > 0) {
				this.whitespaceLines += 1;
			}
		}

		// Tries to find out how many lines are taken up by comments
		// Regex from http://ostermiller.org/findcomment.html
		var blockComments = this.text.match(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)/);
		var lineComments = this.text.match(/(\/\/.*)/);
		if (blockComments != null) {
			for (var i = 0; (i < blockComments.length); ++i) {
				if (!blockComments[i]) continue;
				this.commentLines += blockComments[i].split(/\n/).length - 1;
			}
		}
		if (lineComments != null) {
			this.commentLines += lineComments.length - 1;
		}

		this.codeLines = this.totalLines - this.whitespaceLines - this.commentLines;

		this.stage += 1;
		break;
	case 1: // tokenising
		this.sendMessage("Tokenising source code...");

		var tokeniser = new Tokeniser();
		this.tokens = tokeniser.tokenise(this.text);
		
		this.stage += 1;
		break;
	case 2: // basic operation and control structure processing
		this.sendMessage("Processing operations and control structures...");

		for (var i in this.tokens) {
			var token = this.tokens[i];
			if (token in this.basicOperations) this.basicOperations[token] += 1;
			else if (token in this.controlStructures) this.controlStructures[token] += 1;
		}

		this.stage += 1;
		break;
	case 3: // algorithm complexity
		this.sendMessage("Calculating highest algorithmic complexity...");

		var currentDepth = 0
		for (var i in this.tokens) {
			var token = this.tokens[i];
			
			if (token == "while" || token == "for" || token == "foreach") {
				currentDepth += 1;
				if (currentDepth > this.deepestNestedLoop) {
					this.deepestNestedLoop = currentDepth;
				}
			} else if (token == "}") {
				currentDepth -= 1;
				if (currentDepth < 0) currentDepth = 0;
			}
		}

		this.stage += 1;
		return this;
	}
}

LanguageStatistics.prototype.getOperationsCount = function() {
	return getTotal(this.basicOperations);
}

LanguageStatistics.prototype.getControlStructCount = function() {
	return getTotal(this.controlStructures);
}

LanguageStatistics.prototype.getMostUsedVariables = function(amount) {
	return getLargestValues(this.variables, amount);
}

LanguageStatistics.prototype.getMostUsedFunctions = function(amount) {
	return getLargestValues(this.functions, amount);
}

LanguageStatistics.prototype.getHighestComplexity = function() {
	// NOTE: only works for quadratic algorithms
	if (this.deepestNestedLoop == 0) {
		return "O(1)";
	} else if (this.deepestNestedLoop == 1) {
		return "O(n)";
	} else if (this.deepestNestedLoop >= 2) {
		return "O(n^" + this.deepestNestedLoop + ")";
	} else {
		return "O(?)";
	}
}



/* ---------------------------------------------------------- */
/*                          JavaScript                        */
/* ---------------------------------------------------------- */

function JSStatistics(text, sendMessage) {
	// call superclass constructor
	LanguageStatistics.call(this, text, sendMessage);
	this.jsStage = 0;
}

// Inherits from LanguageStatistics
JSStatistics.prototype = new LanguageStatistics();
JSStatistics.prototype.constructor = JSStatistics;

JSStatistics.prototype.run = function(value) {
	switch (this.jsStage) {
	case 0:
		// Only start processing JS-specific stuff when superclass
		// has complete its own processing
		if (LanguageStatistics.prototype.run.call(this, value)) this.jsStage += 1;
		break;
	case 1: // functions and variable processing
		this.sendMessage("Detecting variables and functions...");

		for (var i = 0; (i < this.tokens.length); ++i) {
			var token = this.tokens[i];

			if (token == "var") {
				this.variables[this.tokens[i + 1]] = 0;
				this.variableCount += 1;
				i += 1;
			} else if (token == "function") {
				var nextToken = this.tokens[i + 1];
				if (nextToken) {
					if (nextToken == "(") { // argument list already started, go back!
						var previousToken = this.tokens[i - 1];
						if (previousToken && previousToken == "=") {
							var tokenBeforeThat = this.tokens[i - 2];
							if (tokenBeforeThat) {
								this.functions[tokenBeforeThat] = 0;
								this.functionCount += 1;
							} else {
								this.functions["anonymous_function"] = 0;
								this.functionCount += 1;
							}
						} else {
							this.functions["anonymous_function"] = 0;
							this.functionCount += 1;
						}
					} else {
						this.functions[nextToken] = 0;
						this.functionCount += 1;
					}
				}
			}
		}

		this.jsStage += 1;
		break;
	case 2: // detecting how much each variable and func is used
		this.sendMessage("More variables and functions processing...");

		for (var i in this.tokens) {
			var token = this.tokens[i];

			if (token in this.variables) {
				this.variables[token] += 1;
			} else {
				if (token in this.functions) {
					this.functions[token] += 1;
				}
			}
		}

		this.jsStage += 1;
		return this;
	}
}



/* ---------------------------------------------------------- */
/*               C-Style Languages (Java/C#/C++)              */
/* ---------------------------------------------------------- */

function CStyleStatistics(text, sendMessage) {
	LanguageStatistics.call(this, text, sendMessage);

	// Need to be filled by subclasses
	this.classes = [];
	this.structs = [];
	this.objectCreationCount = 0; // calls to 'new'

	this.cStage = 0;
}

// Inherits from LanguageStatistics
CStyleStatistics.prototype = new LanguageStatistics();
CStyleStatistics.prototype.constructor = CStyleStatistics;

CStyleStatistics.prototype.validSymbolName = function(name) {
	if (!name) return false;
	var matches = name.match(/[a-zA-Z_][0-9a-zA-Z_]*/);
	return (matches && matches.length == 1) ? true : false;
}

CStyleStatistics.prototype.run = function(value) {
	switch (this.cStage) {
	case 0:
		if (LanguageStatistics.prototype.run.call(this, value)) this.cStage += 1;
		break;
	case 1: // object processing
		this.sendMessage("Detecting classes and methods...");

		this.processOO();

		this.cStage += 1;
		break;
	case 2: // functions and variable processing
		this.sendMessage("Detecting variables and functions...");

		for (var i = 0; (i < this.tokens.length); ++i) {
			var token = this.tokens[i];
			
			if (this.validSymbolName(token)) {
				var nextToken = this.tokens[i + 1];

				if (nextToken && this.validSymbolName(nextToken)) {
					var tokenAfterThat = this.tokens[i + 2];

					if (tokenAfterThat) {
						if (tokenAfterThat == "=" || tokenAfterThat == ";") {
							this.variables[nextToken] = 0;
							this.variableCount += 1;
						} else if (tokenAfterThat == "(") {
							this.functions[nextToken] = 0;
							this.functionCount += 1;
						}
					}
				}
			}
		}

		this.cStage += 1;
		break;
	case 3: // detecting how much each variable and func is used
		this.sendMessage("More variables and functions processing...");

		for (var i in this.tokens) {
			var token = this.tokens[i];

			if (token in this.variables) {
				this.variables[token] += 1;
			} else {
				if (token in this.functions) {
					this.functions[token] += 1;
				}
			}
		}

		this.cStage += 1;
		return this;
	}
}

CStyleStatistics.prototype.getClassCount = function() {
	return this.classes.length;
}

CStyleStatistics.prototype.getStructCount = function() {
	return this.structs.length;
}

CStyleStatistics.prototype.getTotalMethods = function() {
	var total = 0;
	for (var i = 0; (i < this.classes.length); ++i) {
		total += this.classes[i].methods.length;
	}
	for (var i = 0; (i < this.structs.length); ++i) {
		total += this.structs[i].methods.length;
	}
	return total;
}

CStyleStatistics.prototype.getTotalProperties = function() {
	var total = 0;
	for (var i = 0; (i < this.classes.length); ++i) {
		total += this.classes[i].properties.length;
	}
	for (var i = 0; (i < this.structs.length); ++i) {
		total += this.structs[i].properties.length;
	}
	return total;
}

// CStyleStatistics.prototype.getClassTree = function() {
// 	var root = new ClassNode("Root", "");
// 	 // contains the names of classes that have already been processed
// 	var namesProcessed = [];

// 	for (var i = 0; (i < this.classes.length); ++i) {
// 		root.addChild(this.processClass(this.classes[i].name, root));
// 	}

// 	// Now recursively generates out each class
// 	alert(printStuff(root));

// 	return root;
// }

// function printStuff(node, depth) {
// 	var depth = depth || 0;
// 	var text = "";

// 	for (var i = 0; (i < depth); ++i) {
// 		text += "    ";
// 	}
// 	text += node.name + "\n";

// 	for (var i = 0; (i < node.children.length); ++i) {
// 		text += printStuff(node.children[i], depth + 1);
// 	}

// 	return text;
// }

// CStyleStatistics.prototype.processClass = function(name, parentNode) {
// 	// First, finds the class
// 	var cls = undefined;
// 	for (var i = 0; (i < this.classes.length); ++i) {
// 		if (name == this.classes[i].name) {
// 			cls = this.classes[i];
// 		}
// 	}
// 	if (!cls) return undefined;

// 	// Generates a description for the class
// 	var description = "TODO";

// 	// Creates the actual node
// 	var node = new ClassNode(cls.name, description);
// 	// 
// 	for (var i = 0; (i < cls.parentNames.length); ++i) {
// 		var parent = this.processClass(cls.parentNames[i], parentNode);
// 		if (parent) {
// 			parentNode.addChild(parent);
// 			parent.addChild(node);
// 		}
// 	}

// 	return node;
// }


// /* Start of class ClassNode */

// function ClassNode(name, description) {
// 	this.name = name;
// 	this.description = description;
// 	this.children = [];
// }

// ClassNode.prototype.addChild = function(child) {
// 	// Checks if a class with this name is already a child
// 	// If so, do not add it to the list of children
// 	for (var i = 0; (i < this.children.length); ++i) {
// 		if (child.name == this.children[i].name) {
// 			return;
// 		}
// 	}
// 	this.children.push(child);
// }

// ClassNode.prototype.containsChild = function(child) {
// 	for (var i = 0; (i < this.children.length); ++i) {
// 		if (child.name == this.children[i].name) {
// 			return true;;
// 		} else {
// 			if (this.children[i].containsChild(child.name)) {
// 				return true;
// 			}
// 		}
// 	}
// 	return false;
// }

// /* End of class ClassNode */

/* A method that is meant to be overloaded by child classes so
 * each programming language can have its own OO parsing code. */
CStyleStatistics.prototype.processOO = function() {
	// EMPTY
}


/* ---------------------------------------------------------- */
/*                     Object Oriented Stuff                  */
/* ---------------------------------------------------------- */

/* Start of class Class */

function Class(name) {
	this.name = name;
	this.properties = [];
	this.methods = [];
	this.parentNames = [];
}

Class.prototype.addProperty = function(name) {
	this.properties.push(name);
}

Class.prototype.addMethod = function(name) {
	this.methods.push(name);
}

/* End of class Class */

/* Start of class Struct */

function Struct(name) {
	this.name = name;
	this.variables = [];
	this.referenceCount = 0;
}

Struct.prototype.addVariable = function(name) {
	this.variables.push(name);
}

/* End of class Struct */



/* ---------------------------------------------------------- */
/*                             Java                           */
/* ---------------------------------------------------------- */

function JavaStatistics(text, sendMessage) {
	CStyleStatistics.call(this, text, sendMessage);
}

JavaStatistics.prototype = new CStyleStatistics();
JavaStatistics.prototype.constructor = JavaStatistics;

JavaStatistics.prototype.processOO = function () {

	// Before scanning for classes, search for any instances of 'new'
	// to get object creation count
	for (var i = 0; (i < this.tokens.length); ++i) {
		if (this.tokens[i] == "new") {
			this.objectCreationCount += 1;
		}
	}

	for (var i = 0; (i < this.tokens.length); ++i) {
		var token = this.tokens[i];

		if (token == "class" || token == "interface") {
			var startIndex = i;

			// Gets class name and creates class object
			var cls = undefined;
			var name = this.tokens[++i];
			if (name) cls = new Class(name);
			else continue;

			// Checks if class has any superclasses
			token = this.tokens[++i];
		
			if (token == "extends") {
				cls.parentNames.push(this.tokens[++i]);
				i += 1; // skip to next token (either implements or {)
			}

			// Interface check
			token = this.tokens[i];
			if (token == "implements") {
				while (true) {
					cls.parentNames.push(this.tokens[++i]);
					token = this.tokens[++i];
					// break the loop if there's no more interfaces implemented
					if (!(token && token == ",")) break;
				}
			}

			// Method and property check
			var depth = 0;
			do {
				token = this.tokens[i];
				i += 1;

				if (token == "{") {
					depth += 1;
				} else if (token == "}") {
					depth -= 1;

				// If we're NOT in a method body, check for properties and methods
				} else if (depth < 2) {
					if (this.validSymbolName(token)) {
						var nextToken = this.tokens[i];

						if (nextToken && this.validSymbolName(nextToken)) {
							var tokenAfterThat = this.tokens[i + 1];

							if (tokenAfterThat) {
								if (tokenAfterThat == "=" || tokenAfterThat == ";") {
									cls.addProperty(nextToken);
								} else if (tokenAfterThat == "(") {
									cls.addMethod(nextToken);
								}
							}
						}
					}

				}
			} while (depth > 0);

			// remove class tokens
			this.tokens.splice(startIndex, i - startIndex);
			i = startIndex - 1;

			// Finally, add the class to the list
			this.classes.push(cls);
		}
	}
}



/* ---------------------------------------------------------- */
/*                              C#                            */
/* ---------------------------------------------------------- */

function CSStatistics(text, sendMessage) {
	CStyleStatistics.call(this, text, sendMessage);
}

CSStatistics.prototype = new CStyleStatistics();
CSStatistics.prototype.constructor = CSStatistics;

CSStatistics.prototype.processOO = function () {

	// Before scanning for classes, search for any instances of 'new'
	// to get object creation count
	for (var i = 0; (i < this.tokens.length); ++i) {
		if (this.tokens[i] == "new") {
			this.objectCreationCount += 1;
		}
	}

	for (var i = 0; (i < this.tokens.length); ++i) {
		var token = this.tokens[i];

		if (token == "class" || token == "interface" || token == "struct") {
			var startIndex = i;

			// Gets class name and creates class object
			var cls = undefined;
			var name = this.tokens[++i];
			if (name) cls = new Class(name);
			else continue;

			// Superclass AND I nterface check
			token = this.tokens[++i];
			if (token == ":") {
				while (true) {
					cls.parentNames.push(this.tokens[++i]);
					token = this.tokens[++i];
					// break the loop if there's no more interfaces implemented
					if (!(token && token == ",")) break;
				}
			}

			// Method and property check
			var depth = 0;
			do {
				token = this.tokens[i];
				i += 1;

				if (token == "{") {
					depth += 1;
				} else if (token == "}") {
					depth -= 1;

				// If we're NOT in a method body, check for properties and methods
				} else if (depth < 2) {
					if (this.validSymbolName(token)) {
						var nextToken = this.tokens[i];

						if (nextToken && this.validSymbolName(nextToken)) {
							var tokenAfterThat = this.tokens[i + 1];

							if (tokenAfterThat) {
								if (tokenAfterThat == "=" || tokenAfterThat == ";") {
									cls.addProperty(nextToken);
								} else if (tokenAfterThat == "(") {
									cls.addMethod(nextToken);
								}
							}
						}
					}

				}
			} while (depth > 0);

			// remove class tokens
			this.tokens.splice(startIndex, i - startIndex);
			i = startIndex - 1;

			// Finally, add the class to the list
			this.classes.push(cls);
		}
	}
}



/* ---------------------------------------------------------- */
/*                              C++                           */
/* ---------------------------------------------------------- */

function CPPStatistics(text, sendMessage) {
	CStyleStatistics.call(this, text, sendMessage);
}

CPPStatistics.prototype = new CStyleStatistics();
CPPStatistics.prototype.constructor = CPPStatistics;

CPPStatistics.prototype.processOO = function () {

	// Before scanning for classes, search for any instances of 'new'
	// to get object creation count
	for (var i = 0; (i < this.tokens.length); ++i) {
		if (this.tokens[i] == "new") {
			this.objectCreationCount += 1;
		}
	}

	for (var i = 0; (i < this.tokens.length); ++i) {
		var token = this.tokens[i];

		if (token == "class" || token == "struct") {
			var startIndex = i;

			// Gets class name and creates class object
			var cls = undefined;
			var name = this.tokens[++i];
			if (name) cls = new Class(name);
			else continue;

			// Superclass AND I nterface check
			token = this.tokens[++i];
			if (token == ":") {
				while (true) {
					// First, check if class name is an access specifier. If so, ignore it
					token = this.tokens[++i];
					if (token == "public" || token == "protected" || token == "private") {
						token = this.tokens[++i]; // move onto next token
					}

					cls.parentNames.push(token);
					token = this.tokens[++i];
					// break the loop if there's no more superclasses implemented
					if (!(token && token == ",")) break;
				}
			}

			// Method and property check
			var depth = 0;
			do {
				token = this.tokens[i];
				i += 1;

				if (token == "{") {
					depth += 1;
				} else if (token == "}") {
					depth -= 1;

				// If we're NOT in a method body, check for properties and methods
				} else if (depth < 2) {
					if (this.validSymbolName(token)) {
						var nextToken = this.tokens[i];

						if (nextToken && this.validSymbolName(nextToken)) {
							var tokenAfterThat = this.tokens[i + 1];

							if (tokenAfterThat) {
								// TODO: check more 
								if (tokenAfterThat == "=" || tokenAfterThat == ";") {
									cls.addProperty(nextToken);
								} else if (tokenAfterThat == "(") {
									cls.addMethod(nextToken);
								}
							}
						}
					}

				}
			} while (depth > 0);

			// remove class tokens
			this.tokens.splice(startIndex, i - startIndex);
			i = startIndex - 1;

			// Finally, add the class to the list
			this.classes.push(cls);
		}
	}
}
