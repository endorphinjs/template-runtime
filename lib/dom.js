/**
 * Creates element with given tag name
 * @param {string} tagName
 * @param {string} [cssScope] Scope for CSS isolation
 * @return {Element}
 */
export function elem(tagName, cssScope) {
	const el = document.createElement(tagName);
	cssScope && el.setAttribute(cssScope, '');
	return el;
}

/**
 * Creates element with given tag name under `ns` namespace
 * @param {string} tagName
 * @param {string} ns
 * @param {string} [cssScope] Scope for CSS isolation
 * @return {Element}
 */
export function elemNS(tagName, ns, cssScope) {
	const el = document.createElementNS(ns, tagName);
	cssScope && el.setAttribute(cssScope, '');
	return el;
}

/**
 * Creates element with given tag name and text
 * @param {string} tagName
 * @param {string} text
 * @param {string} [cssScope] Scope for CSS isolation
 * @return {Element}
 */
export function elemWithText(tagName, text, cssScope) {
	const el = elem(tagName, cssScope);
	el.textContent = textValue(text);
	return el;
}

/**
 * Creates element with given tag name under `ns` namespace and text
 * @param {string} tagName
 * @param {string} ns
 * @param {string} text
 * @param {string} [cssScope] Scope for CSS isolation
 * @return {Element}
 */
export function elemNSWithText(tagName, ns, text, cssScope) {
	const el = elemNS(tagName, ns, cssScope);
	el.textContent = textValue(text);
	return el;
}

/**
 * Creates text node with given value
 * @param {String} value
 * @returns {Text}
 */
export function text(value) {
	return document.createTextNode(textValue(value));
}

/**
 * Updates given text node value, if required
 * @param {Text} node
 * @param {*} value
 * @param {*} prevValue
 * @return {*} New value used in text node
 */
export function updateText(node, value, prevValue) {
	if (value !== prevValue) {
		node.nodeValue = textValue(value);
		return value;
	}

	return prevValue;
}

/**
 * Returns textual representation of given `value` object
 * @param {*} value
 * @returns {string}
 */
function textValue(value) {
	return value != null ? value : '';
}
