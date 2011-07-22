/* A collection of useful, general-purpose utility functions.
 * Some of these require JQuery to work. */

/* Useful for dynamically placing elements at the centre of the screen. */
jQuery.fn.center_x = function() {
	this.css("position","absolute");
	this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
}
jQuery.fn.center_y = function() {
	this.css("position","absolute");
	this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
}
jQuery.fn.center = function() {
	this.center_x();
	this.center_y();
    return this;
}

/* Rounds a number to the specified amount of decimal places.
 *  num - Number to round
 *  dec - How many decimal places you want to round to.
 * Returns the rounded number. */
function roundNumber(num, dec) {
	var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	return result;
}