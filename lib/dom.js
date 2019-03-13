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
	const node = document.createTextNode(textValue(value));
	node['$value'] = value;
	return node;
}

/**
 * Updates given text node value, if required
 * @param {Text} node
 * @param {*} value
 * @returns {number} Returns `1` if text was updated, `0` otherwise
 */
export function updateText(node, value) {
	if (value !== node['$value']) {
		node.nodeValue = textValue(value);
		node['$value'] = value;
		return 1;
	}

	return 0;
}

/**
 * @param {Node} node
 * @param {Node} parent
 * @param {Node} anchor
 * @returns {Node} Inserted item
 */
export function domInsert(node, parent, anchor) {
	return anchor
		? parent.insertBefore(node, anchor)
		: parent.appendChild(node);
}

/**
 * Removes given DOM node from its tree
 * @param {Node} node
 */
export function domRemove(node) {
	const { parentNode } = node;
	parentNode && parentNode.removeChild(node);
}

/**
 * Returns textual representation of given `value` object
 * @param {*} value
 * @returns {string}
 */
function textValue(value) {
	return value != null ? value : '';
}
