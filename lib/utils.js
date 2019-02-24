/**
 * Creates fast object
 * @param {Object} [proto]
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
 * @returns {number} Returns `1` if data was updated, `0` otherwise
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
 * @returns {ChangeSet}
 */
export function changeSet() {
	return { prev: obj(), cur: obj() };
}

/**
 * Returns properties from `next` which were changed since `prev` state.
 * Returns `null` if there are no changes
 * @param {Object} next
 * @param {Object} prev
 * @return {Changes}
 */
export function changed(next, prev, prefix = '') {
	/** @type {Changes} */
	const result = obj();
	let dirty = false;

	// Check if data was actually changed
	for (const p in next) {
		if (prev[p] !== next[p]) {
			dirty = true;
			result[prefix ? prefix + p : p] = {
				prev: prev[p],
				current: next[p]
			};
		}
	}

	return dirty ? result : null;
}

/**
 * Moves contents of given `from` element into `to` element
 * @param {Element | DocumentFragment} from
 * @param {Element} to
 * @returns {Element} The `to` element
 */
export function moveContents(from, to) {
	if (from !== to) {
		if (from.nodeType === from.DOCUMENT_FRAGMENT_NODE) {
			to.appendChild(from);
		} else {
			let node;
			while (node = from.firstChild) {
				to.appendChild(node);
			}
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
	const cssScope = host && host.componentModel && host.componentModel.definition.cssScope;
	cssScope && el.setAttribute(cssScope, '');
	return el;
}

/**
 * Queues given `fn` function to be invoked asynchronously as soon as possible
 * @param {(value: void) => void} fn
 * @returns {Promise}
 */
export function nextTick(fn) {
	return Promise.resolve().then(fn);
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

/**
 * Assign data from `next` to `prev` if there are any updates
 * @param {object} prev
 * @param {object} next
 * @return {boolean} Returns `true` if data was assigned
 */
export function assignIfNeeded(prev, next) {
	for (const p in next) {
		if (next.hasOwnProperty(p) && prev[p] !== next[p]) {
			return assign(prev, next);
		}
	}
}

/**
 * Represents given attribute value in element
 * @param {Element} elem
 * @param {string} name
 * @param {*} value
 */
export function representAttributeValue(elem, name, value) {
	const type = typeof(value);

	if (type === 'boolean') {
		value = value ? '' : null;
	} else if (type === 'function') {
		value = '𝑓';
	} else if (Array.isArray(value)) {
		value = '[]';
	} else if (isDefined(value) && type === 'object') {
		value = '{}';
	}

	isDefined(value) ? elem.setAttribute(name, value) : elem.removeAttribute(name);
}
