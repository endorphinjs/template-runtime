import { add } from '../runtime';
import { block, isBlock } from './injector';
import { invoked } from './utils';

const key = 'attributes';
const attrMask = 1;

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
export function renderAttribute(scope, injector, name, value) {
	const b = block(injector, key);
	const data = b.data = { name: null, value: null };
	b.dispose = () => injector.updated |= attrMask;

	return invoked(() => {
		const curName = String(typeof name === 'function' ? name(scope) : name);
		const curValue = typeof value === 'function' ? value(scope) : value;

		if (curName !== data.name || curValue !== data.value) {
			injector.updated |= attrMask;
			data.name = curName;
			data.value = curValue;
		}
	});
}

/**
 * Applies pending updates to injector container, if required
 * @param {Injector} injector
 */
export function finalizeAttributes(injector) {
	if (!(injector.updated & attrMask)) {
		return;
	}

	const { items, attributes, parentNode } = injector;
	const cur = Object.create(null);
	const changes = [];

	// Mark updated attributes
	for (let i = items.length - 1; i >= 0; i--) {
		const item = items[i];
		if (isBlock(item) && item.type === key) {
			const { name, value } = item.data;
			if (!(name in cur)) {
				cur[name] = value;
				if (!attributes || attributes[name] !== value) {
					changes.push(name);
				}
			}
		}
	}

	// Mark removed attributes
	if (attributes) {
		for (const attr in attributes) {
			if (!(attr in cur)) {
				changes.push(attr);
			}
		}
	}

	// Apply changes
	// TODO apply changes as a single operation to component
	for (let i = changes.length - 1; i >= 0; i--) {
		const name = changes[i];
		const value = cur[name];
		// null, undefined or NaN should remove attribute
		if (value == null || value !== value) {
			parentNode.removeAttribute(name);
		} else {
			parentNode.setAttribute(name, value);
		}
	}

	injector.updated ^= attrMask;
	injector.attributes = cur;
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
