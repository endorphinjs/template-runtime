import { isDefined, finalizeItems, obj, representAttributeValue, changeSet } from './utils';

/**
 * Sets value of attribute `name` to `value`
 * @param {Injector} injector
 * @param {string} name
 * @param {*} value
 * @return {number} Update status. Always returns `0` since actual attribute value
 * is defined in `finalizeAttributes()`
 */
export function setAttribute(injector, name, value) {
	injector.attributes.cur[name] = value;
	return 0;
}

/**
 * Sets value of attribute `name` under namespace of `nsURI` to `value`
 *
 * @param {Injector} injector
 * @param {string} nsURI
 * @param {string} name
 * @param {*} value
 */
export function setAttributeNS(injector, nsURI, name, value) {
	if (!injector.attributesNS) {
		injector.attributesNS = obj();
	}

	const { attributesNS } = injector;

	if (!attributesNS[nsURI]) {
		attributesNS[nsURI] = changeSet();
	}

	attributesNS[nsURI].cur[name] = value;
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
 * @return {number}
 */
export function finalizeAttributes(injector) {
	const { attributes, attributesNS } = injector;

	if (isDefined(attributes.cur['class'])) {
		attributes.cur['class'] = normalizeClassName(attributes.cur['class']);
	}

	let updated = finalizeItems(attributes, changeAttribute, injector.parentNode);

	if (attributesNS) {
		const ctx = { node: injector.parentNode, ns: null };
		for (let ns in attributesNS) {
			ctx.ns = ns;
			updated |= finalizeItems(attributesNS[ns], changeAttributeNS, ctx);
		}
	}

	return updated;
}

/**
 * Normalizes given class value: removes duplicates and trims whitespace
 * @param {string} str
 * @returns {string}
 */
export function normalizeClassName(str) {
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
 * @param {{node: Element, ns: string}} ctx
 */
function changeAttributeNS(name, prevValue, newValue, ctx) {
	if (isDefined(newValue)) {
		ctx.node.setAttributeNS(ctx.ns, name, newValue);
	} else if (isDefined(prevValue)) {
		ctx.node.removeAttributeNS(ctx.ns, name);
	}
}
