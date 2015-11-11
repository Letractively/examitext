![http://wiki.examitext.googlecode.com/hg/header.png](http://wiki.examitext.googlecode.com/hg/header.png)

Version 0.1.0 has been released! Check out the [Downloads](http://code.google.com/p/examitext/downloads/list) section for the distribution files, in addition to snapshots of the source code and project files.

Examitext is a tool which analyses three different kinds of textual data - text documents, chat logs and source code - providing various statistics and information on the data. Both the back-end processing and the front-end interface are developed purely in JavaScript, and can be run in any modern browser. In addition to that, there is an alternate PHP version of Examitext, which allows users to input local or remote (given a URL) files, rather than pasting in the text directly.

# Features #

  * Natural Language Analysis
    * Scans text from eight languages - English, French, German, Italian, Spanish, Portuguese, Swedish and Finnish
    * Stems words to their base form to prevent redundant entries
    * Filters common words using stoplists
  * Programming Language Analysis
    * HTML parser, which can detect used CSS IDs/classes/inline styles
    * Loose parsing for JavaScript, Java, C# and C++
    * Calculating inheritance hierarchy for object-oriented languages
  * Text Documents, statistics include:
    * Paragraph size distribution and trends
    * Ten most frequently occurring topics
    * Use of punctuation
    * and more
  * Chat Logs
    * Speaking habits of each participant of the conversation (e.g. average message length, average number of consecutive messages, etc.)
    * How much each participant contributes to the conversation
    * Most talked about topics and frequency/relative frequency of most spoken words for each participant (after stemming/filtering)
  * Source Code
    * HTML
      * Listing most used tags/CSS classes
      * Getting number of resources (e.g. stylesheets, scripts, images) are referenced
    * All Languages
      * Calculating how much basic operations (e.g. =, +, -, %) are in the source code
      * Calculating how many heap memory allocations are performed (via 'new')
      * Determining highest quadratic time complexity to aid in algorithm analysis/optimisation
    * JavaScript
      * Scanning global and local functions declared and determining how much they're used
    * Java/C#/C++
      * Scanning document for all declared classes/interfaces, as well as their methods and properties
      * Building and displaying an inheritance hierarchy for all the classes defined


# Screenshots #

| ![![](http://wiki.examitext.googlecode.com/hg/Thumbnail%20-%20Examitext%20Screenshot%201.png)](http://wiki.examitext.googlecode.com/hg/Examitext%20Screenshot%201.png) | ![![](http://wiki.examitext.googlecode.com/hg/Thumbnail%20-%20Examitext%20Screenshot%202.png)](http://wiki.examitext.googlecode.com/hg/Examitext%20Screenshot%202.png) | ![![](http://wiki.examitext.googlecode.com/hg/Thumbnail%20-%20Examitext%20Screenshot%203.png)](http://wiki.examitext.googlecode.com/hg/Examitext%20Screenshot%203.png) | ![![](http://wiki.examitext.googlecode.com/hg/Thumbnail%20-%20Examitext%20Screenshot%204.png)](http://wiki.examitext.googlecode.com/hg/Examitext%20Screenshot%204.png) | ![![](http://wiki.examitext.googlecode.com/hg/Thumbnail%20-%20Examitext%20Screenshot%205.png)](http://wiki.examitext.googlecode.com/hg/Examitext%20Screenshot%205.png) |
|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Main interface                                                                                                                                                         | Results of a document analysis                                                                                                                                         | Results of a chat log analysis                                                                                                                                         | Results of a webpage analysis                                                                                                                                          | Results of an OO language analysis                                                                                                                                     |

# Installation #

No installation required. Simply open examitext.html in any modern browser to run the application.

# License Notes #

Any code that is not one of the dependencies mentioned below is licensed under the New BSD License. See LICENSE in the repository for the full license.

**JQuery** and **Easy Tooltip** are licensed under the MIT License.

**Highcharts** is licensed under the Creative Commons Attribution-NonCommercial 3.0 License.

**jsSnowball** and [John Resig's](http://ejohn.org) **HTML Parser** are licensed under the [Mozilla Public License](http://www.mozilla.org/MPL/).