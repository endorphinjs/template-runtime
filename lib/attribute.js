import { add } from '../runtime';
import { block, isBlock } from './injector';
import { invoked } from './utils';

/**
 * Sets value of attribute `name` to value returned by `query` function
 * @param {Scope} scope
 * @param {Element} elem
 * @param {string} name
 * @param {Function} expr
 */
export function setAttribute(scope, elem, name, expr) {
	let lastValue;
	return invoked(() => {
		const value = expr(scope);
		if (value !== lastValue) {
			elem.setAttribute(name, lastValue = value);
		}
	});
}

/**
 * Renders `attribute` instruction
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {string | function} name
 * @param {string | function} value
 * @param {function} [condition]
 * @return {function}
 */
export function renderAttribute(scope, injector, name, value, condition) {
	const b = block(injector, 'attribute');
	const data = b.data = { name: null, value: null };
	b.dispose = () => disposeAttributeEntry(injector, b);

	return invoked(() => {
		if (!condition || condition(scope)) {
			const curName = String(typeof name === 'function' ? name(scope) : name);
			const curValue = typeof value === 'function' ? value(scope) : value;

			if (curName !== data.name) {
				disposeAttributeEntry(injector, b);
				data.name = curName;
				data.value = null;
			}

			if (data.name && curValue !== data.value) {
				data.value = curValue;
				setAttributeEntry(injector, b);
			}
		} else {
			disposeAttributeEntry(injector, b);
		}
	});
}

/**
 * Renders `add class` instruction
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {Function} expr
 */
export function renderAddClass(scope, injector, expr) {
	let lastValue;
	add(injector, () => {
		if (lastValue != null) {
			injector.parentNode.classList.remove(lastValue);
		}
	});

	return invoked(() => {
		const value = expr(scope);
		if (value !== lastValue) {
			const { parentNode } = injector;
			if (lastValue != null) {
				parentNode.classList.remove(lastValue);
			}

			if (value != null) {
				parentNode.classList.add(value);
			}

			lastValue = value;
		}
	});
}

function setAttr(injector, name, value) {
	const { parentNode } = injector;

	if (value == null) {
		parentNode.removeAttribute(name);
	} else {
		parentNode.setAttribute(name, value);
	}
}

/**
 * Disposes contents of given attribute entry and restores previous attribute value
 * @param {Injector} injector
 * @param {String} name
 * @param {Block} block
 */
function disposeAttributeEntry(injector, block) {
	const { name } = block.data;
	if (!name) {
		return;
	}

	const { items } = injector;
	let ix = items.indexOf(block);
	block.data.value = null;

	// Check if we should restore value: check for next non-empty attribute, if
	// it exists then we should do nothing since it’s already defined in element.
	// Otherwise, get previous non-empty value and restore it
	if (!hasNextAttribute(injector, name, ix + 1)) {
		let prev;
		while (ix > 0) {
			if (isNonEmptyAttribute(items[--ix], name)) {
				prev = items[ix];
				break;
			}
		}

		setAttr(injector, name, prev && prev.data.value);
	}
}

function setAttributeEntry(injector, block) {
	const { name, value } = block.data;

	if (name && !hasNextAttribute(injector, name, injector.items.indexOf(block) + 1)) {
		setAttr(injector, name, value);
	}
}

/**
 * Finds attribute block with non-empty value next to given position
 * @param {Injector} injector
 * @param {string} name
 * @param {number} from
 * @returns {boolean}
 */
function hasNextAttribute(injector, name, from = 0) {
	const { items } = injector;

	while (from < items.length) {
		if (isNonEmptyAttribute(items[from++], name)) {
			return true;
		}
	}
}

function isNonEmptyAttribute(block, name) {
	return isBlock(block) && block.type === 'attribute' && block.data.name === name && block.data.value != null;
}
