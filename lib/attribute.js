import { isDefined, finalizeItems, obj, representAttributeValue } from './utils';

/**
 * Sets value of attribute `name` to `value`
 * @param {Injector} injector
 * @param {string} name
 * @param {*} value
 */
export function setAttribute(injector, name, value) {
	injector.attributes.cur[name] = value;
}

/**
 * Updates `attrName` value in `elem`, if required
 * @param {HTMLElement} elem
 * @param {string} attrName
 * @param {*} value
 * @param {*} prevValue
 * @returns {*} New attribute value
 */
export function updateAttribute(elem, attrName, value, prevValue) {
	if (value !== prevValue) {
		changeAttribute(attrName, prevValue, value, elem);
		return value;
	}

	return prevValue;
}

/**
 * Updates props in given component, if required
 * @param {Component} elem
 * @param {object} data
 * @return {boolean} Returns `true` if value was updated
 */
export function updateProps(elem, data) {
	const { props } = elem;
	let updated;

	for (let p in data) {
		if (data.hasOwnProperty(p) && props[p] !== data[p]) {
			if (!updated) {
				updated = obj();
			}
			updated[p] = data[p];
		}
	}

	if (updated) {
		elem.setProps(data);
		return true;
	}

	return false;
}

/**
 * Adds given class name as pending attribute
 * @param {Injector} injector
 * @param {string} value
 */
export function addClass(injector, value) {
	if (isDefined(value)) {
		const className = injector.attributes.cur['class'];
		setAttribute(injector, 'class', isDefined(className) ? className + ' ' + value : value);
	}
}

/**
 * Applies pending attributes changes to injector’s host element
 * @param {Injector} injector
 * @return {number} Update status
 */
export function finalizeAttributes(injector) {
	return finalizeItems(normalize(injector).attributes, changeAttribute, injector.parentNode);
}

/**
 * Applies pending attributes changes to injector’s host element as props
 * @param {Injector} injector
 * @param {Object} [data] Additional props (most likely static ones)
 * @return {Changes} Updated props, if any
 */
export function finalizeProps(injector, data) {
	const changes = data || obj();
	const updated = finalizeItems(normalize(injector).attributes, changeProp, changes);

	if (data || updated) {
		return /** @type {Component} */ (injector.parentNode).setProps(changes);
	}
}

/**
 * Normalizes attributes in given injector
 * @param {Injector} injector
 */
function normalize(injector) {
	const { attributes } = injector;
	const className = attributes.cur['class'];
	if (isDefined(className)) {
		attributes.cur['class'] = normalizeClassName(className);
	}

	return injector;
}

/**
 * Normalizes given class value: removes duplicates and trims whitespace
 * @param {string} str
 * @returns {string}
 */
function normalizeClassName(str) {
	/** @type {string[]} */
	const out = [];
	const parts = String(str).split(/\s+/);

	for (let i = 0, cl; i < parts.length; i++) {
		cl = parts[i];
		if (cl && out.indexOf(cl) === -1) {
			out.push(cl);
		}
	}

	return out.join(' ');
}

/**
 * Callback for changing attribute value
 * @param {string} name
 * @param {*} prevValue
 * @param {*} newValue
 * @param {Element} elem
 */
function changeAttribute(name, prevValue, newValue, elem) {
	if (isDefined(newValue)) {
		representAttributeValue(elem, name, newValue);
	} else if (isDefined(prevValue)) {
		elem.removeAttribute(name);
	}
}

/**
 * Callback for changing attribute value
 * @param {string} name
 * @param {*} prevValue
 * @param {*} newValue
 * @param {object} changes
 */
function changeProp(name, prevValue, newValue, changes) {
	changes[name] = newValue;
}
