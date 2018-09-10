/**
 * Check if given value is an object
 * @param {*} value
 * @returns {Boolean}
 */
export function isObject(value) {
	return value && typeof value === 'object';
}

/**
 * Check if given value is internal EndorphinJS object (e.g. it’s an object and
 * contains specific key)
 * @param {*} value
 * @param {string} key
 * @returns {boolean}
 */
export function isInternalObject(value, key) {
	return isObject(value) && key in value;
}
