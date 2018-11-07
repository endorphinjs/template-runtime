import { emit, on } from 'endorphin';

/**
 * @typedef {ComponentModel} MyComponent
 * @property {() => void} foo
 * @property {(data: string) => string} bar
 */

/** @type {ComponentModel} */
export const methods = {
	foo() {

	},
	bar(data) {
		return data + 'text';
	}
};

export function props() {
	return {
		items: [],
		type: 'foo'
	};
}

export function state() {
	return {
		a: 'b'
	};
}

/**
 * @param {MyComponent} elem
 */
export function init(elem) {
	on(elem, 'click', () => console.log('clicked'));
}

/**
 * @param {ComponentModel} elem
 */
export function willRender(elem) {
	const { props, state } = elem;
	calculateHeight(elem);
	emit(elem, 'foo', 'bar');
}

export function handleClick(event, { state, props, setState }) {
	if (event.which === 1 && props.enabled) {
		setState({
			a: state.a + 1
		});
	}
}

/**
 * @param {ComponentModel} elem
 */
function calculateHeight(elem) {
	console.log('height is', elem.offsetHeight);
}