/* Useful, general-purpose utility functions used in more than
 * one source file. */

/* Rounds a number to the specified amount of decimal places.
 *  num - Number to round.
 *  dec - How many decimal places you want to round to.
 * Returns the rounded number. */
function roundNumber(num, dec) {
	var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	return result.toFixed(2);
}

/* Converts an object into an array of tuples, where each tuple
 * contains a key and its respective value. Additionally, this
 * function sorts the tuples by their second element (the values
 * in the object). */
function toSortedTuples(obj) {
    var tuples = [];

    for (var key in obj) tuples.push([key, obj[key]]);
    tuples.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });

    return tuples;
}

/* IE hack. Global indexOf used so IE doesn't have any problems
 * with it not being defined. */
function indexOf(container, obj) {
	for(var i = 0; i < container.length; i++) {
		if(container[i] == obj) {
			return i;
        }
    }
    return -1;
}

/* Used to get how many instances of the given string are in
 * another string. Example usage:
 *  var str = "hello, bye, haha!"
 *  str.count(","); // 2 */
String.prototype.count=function(s1) { 
    return (this.length - this.replace(new RegExp(s1,"g"), '').length) / s1.length;
}

/* Splits a string into chunks of size 'n'. If n isn't provided,
 * the chunk size is 2. Example usage:
 *  var str = "hello, bye, haha!"
 *  str.chunk(4);
 *  // results in ["hell", "o, b", "ye, ", "haha", "!"] */
String.prototype.chunk = function(n) {
    if (typeof n == 'undefined') n = 2;
    return this.match(RegExp('.{1,'+ n + '}','g'));
}