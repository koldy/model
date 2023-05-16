/**
 * Checks if given variable is array
 *
 * @param {*} obj
 * @return {boolean}
 */
export const isArray = function (obj) {
	return typeof obj === 'object' && obj !== null && obj.constructor === Array;
};

/**
 * Returns true if given var is object (or null)
 * @param {*} obj
 * @returns {boolean} true if object is object, and not array
 */
export const isObject = function (obj) {
	return obj !== null && typeof obj === 'object' && !isArray(obj);
};

/**
 * @param f
 * @return {boolean}
 */
export const isFunction = function (f) {
	return typeof f === 'function';
};

/**
 * @param {*|boolean} x
 * @return {boolean}
 */
export const isBool = function (x) {
	return typeof x === 'boolean';
};

/**
 * Returns true if given date is really instance of Date and that instance is not "Invalid Date". Simple check with "instanceof" is not enough in
 * this case.
 *
 * @param {Date|*} date
 * @returns {boolean}
 * @link https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
 */
export const isValidDate = function (date) {
	return date instanceof Date && !Number.isNaN(date.getTime()) && Number.isFinite(date.getTime());
};

/**
 * Returns object without the props passed to 2nd argument
 *
 * @param {object} obj
 * @param {Array} keys
 */
export const pick = function (obj, keys) {
	const result = {};
	Object.keys(obj).forEach((key) => {
		if (keys.indexOf(key) >= 0) {
			result[key] = obj[key];
		}
	});
	return result;
};

/**
 *  discuss at: https://locutus.io/php/trim/
original by: Kevin van Zonneveld (https://kvz.io)
improved by: mdsjack (https://www.mdsjack.bo.it)
improved by: Alexander Ermolaev (https://snippets.dzone.com/user/AlexanderErmolaev)
improved by: Kevin van Zonneveld (https://kvz.io)
improved by: Steven Levithan (https://blog.stevenlevithan.com)
improved by: Jack
   input by: Erkekjetter
   input by: DxGx
bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  example 1: trim('    Kevin van Zonneveld    ')
  returns 1: 'Kevin van Zonneveld'
  example 2: trim('Hello World', 'Hdle')
  returns 2: 'o Wor'
  example 3: trim(16, 1)
  returns 3: '6'
 *
 * @param {string} str
 * @param charlist
 * @return {string}
 */
export const trim = function (str, charlist = undefined) {
	if (str.length === 0) {
		return '';
	}

	let whitespace = [
		' ',
		'\n',
		'\r',
		'\t',
		'\f',
		'\x0b',
		'\xa0',
		'\u2000',
		'\u2001',
		'\u2002',
		'\u2003',
		'\u2004',
		'\u2005',
		'\u2006',
		'\u2007',
		'\u2008',
		'\u2009',
		'\u200a',
		'\u200b',
		'\u2028',
		'\u2029',
		'\u3000'
	].join('');

	str += '';

	if (charlist) {
		whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1');
	}

	let l = str.length;
	for (let i = 0; i < l; i++) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(i);
			break;
		}
	}

	l = str.length;
	for (let i = l - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(0, i + 1);
			break;
		}
	}

	return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
};
