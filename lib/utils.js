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

/**
 * Returns last item of given array
 * @param {Array} arr
 * @return {*}
 */
export function last(arr) {
	return arr[arr.length - 1];
}

/**
 * Simply returns given function but calls it first
 * @param {Function} fn
 */
export function invoked(fn) {
	fn();
	return fn;
}
