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

/*
if(!Array.indexOf) {
    Array.indexOf = function(obj) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}
if(!String.indexOf) {
    String.indexOf = function(obj) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}*/