/* Useful, general-purpose utility functions used in more than
 * one source file. */

/* Rounds a number to the specified amount of decimal places.
 *  num - Number to round.
 *  dec - How many decimal places you want to round to.
 * Returns the rounded number. */
function roundNumber(num, dec) {
	var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	return result;
}

