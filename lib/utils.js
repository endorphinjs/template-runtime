/**
 * Creates fast object
 * @returns {Object}
 */
export function obj() {
	return Object.create(null);
}

/**
 * Check if given value id defined, e.g. not `null`, `undefined` or `NaN`
 * @param {*} value
 * @returns {boolean}
 */
export function isDefined(value) {
	return value != null && value === value;
}

/**
 * Finalizes updated items, defined in `items.prev` and `items.cur`
 * @param {object} items
 * @param {function} change
 * @param {*} [ctx]
 */
export function finalizeItems(items, change, ctx) {
	const { cur, prev } = items;
	for (const name in cur) {
		const curValue = cur[name], prevValue = prev[name];
		if (curValue !== prevValue) {
			change(name, prevValue, prev[name] = curValue, ctx);
		}
		cur[name] = null;
	}
}

/**
 * Creates object for storing change sets, e.g. current and previous values
 * @returns {object}
 */
export function changeSet() {
	return { prev: obj(), cur: obj() };
}

/**
 * Adds given `scope` attribute to `el` to isolate its CSS
 * @param {HTMLElement} el
 * @param {String} scope
 * @returns {HTMLElement}
 */
export function cssScope(el, scope) {
	scope && el.setAttribute(scope, '');
	return el;
}
