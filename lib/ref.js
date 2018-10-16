import { finalizeItems } from './utils';

export function setRef(scope, name, elem) {
	scope.refs.cur[name] = elem;
}

export function setStaticRef(scope, name, value) {
	const elem = scope.component;

	if (!elem.refs) {
		elem.refs = {};
	}

	value && value.setAttribute(getRefAttr(name, scope), '');
	elem.refs[name] = value;
}

export function finalizeRefs(scope) {
	finalizeItems(scope, scope.component, scope.refs, changeRef);
}

/**
 * Invoked when element reference was changed
 * @param {Element} elem
 * @param {string} name
 * @param {Element} prevValue
 * @param {Element} newValue
 */
function changeRef(scope, elem, name, prevValue, newValue) {
	prevValue && prevValue.removeAttribute(getRefAttr(name, scope));
	setStaticRef(scope, name, newValue);
}

/**
 * Returns attribute name to identify element in CSS
 * @param {String} name
 * @param {Scope} scope
 */
function getRefAttr(name, scope) {
	return `ref-${name}${scope.css ? '-' + scope.css : ''}`;
}
