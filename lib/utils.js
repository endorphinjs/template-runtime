/**
 * Creates fast object
 * @returns {Object}
 */
export function obj(proto = null) {
	return Object.create(proto);
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
 * Check if given value is object
 * @param {*} value
 * @returns {boolean}
 */
export function isObject(value) {
	return isDefined(value) && typeof value === 'object';
}

/**
 * Finalizes updated items, defined in `items.prev` and `items.cur`
 * @param {object} items
 * @param {function} change
 * @param {*} [ctx]
 * @returns {number} Finalization status where 0 means no updates and 1 means
 * data updated
 */
export function finalizeItems(items, change, ctx) {
	let updated = 0;
	const { cur, prev } = items;

	for (const name in cur) {
		const curValue = cur[name], prevValue = prev[name];
		if (curValue !== prevValue) {
			updated = 1;
			change(name, prevValue, prev[name] = curValue, ctx);
		}
		cur[name] = null;
	}

	return updated;
}

/**
 * Creates object for storing change sets, e.g. current and previous values
 * @returns {object}
 */
export function changeSet() {
	return { prev: obj(), cur: obj() };
}

/**
 * Moves contents of given `from` element into `to` element
 * @param {Element | DocumentFragment} from
 * @param {Element} to
 * @returns {Element} The `to` element
 */
export function moveContents(from, to) {
	if (from.nodeType === from.DOCUMENT_FRAGMENT_NODE) {
		to.appendChild(from);
	} else {
		let node;
		while (node = from.firstChild) {
			to.appendChild(node);
		}
	}

	return to;
}


/**
 * Adds given `scope` attribute to `el` to isolate its CSS
 * @param {HTMLElement} el
 * @param {Component} [host]
 * @returns {HTMLElement}
 */
export function cssScope(el, host) {
	const cssScope = host && host.definition.cssScope;
	cssScope && el.setAttribute(cssScope, '');
	return el;
}

const assign = Object.assign || function(target) {
	for (let i = 1, source; i < arguments.length; i++) {
		source = arguments[i];

		for (let p in source) {
			if (source.hasOwnProperty(p)) {
				target[p] = source[p];
			}
		}
	}

	return target;
};

export { assign };
