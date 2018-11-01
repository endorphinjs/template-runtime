import { isDefined, finalizeItems, obj } from './utils';

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
 * @param {object} [data] Additional props (most likely static ones)
 */
export function finalizeProps(injector, data) {
	const changes = data || obj();
	const updated = finalizeItems(normalize(injector).attributes, changeProp, changes);

	if (data || updated) {
		injector.parentNode.setProps(changes);
		representProps(injector.parentNode, changes);
	}

	return updated;
}

/**
 * Normalizes attributes in given injector
 * @param {injector} injector
 */
function normalize(injector) {
	const { attributes } = injector;
	if (isDefined(attributes.cur['class'])) {
		attributes.cur['class'] = normalizeClassName(attributes.cur['class']);
	}

	return injector;
}

/**
 * Normalizes given class value: removes duplicates and trims whitespace
 * @param {string} str
 * @returns {string}
 */
function normalizeClassName(str) {
	const out = [];
	const parts = String(str).split(/\s+/);

	for (let i = 0, cl; i < parts.length; i++) {
		cl = parts[i];
		if (cl && !out.includes(cl)) {
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
		elem.setAttribute(name, newValue);
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

/**
 * Represents given props as attribute values in `elem`
 * @param {HTMLElement} elem
 * @param {object} props
 */
function representProps(elem, props) {
	for (const p in props) {
		const value = props[p];
		const type = typeof(value);

		if (!isDefined(value)) {
			elem.removeAttribute(p);
		} else if (type === 'boolean') {
			value ? elem.setAttribute(p, '') : elem.removeAttribute(p);
		} else {
			let attrValue = '';

			if (type === 'string' || type === 'number') {
				attrValue = value;
			} else if (type === 'function') {
				attrValue = '𝑓';
			} else if (Array.isArray(value)) {
				attrValue = '[]';
			} else if (type === 'object') {
				attrValue = '{}';
			}

			elem.setAttribute(p, attrValue);
		}
	}
}
