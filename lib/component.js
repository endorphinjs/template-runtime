import { elem } from './dom';
import { assign } from './utils';

/**
 * Creates internal lightweight Endorphin component with given definition
 * @param {Scope} scope
 * @param {string} name
 * @param {ComponentDefinition} definition
 * @returns {HTMLElement}
 */
export function component(name, definition, scope) {
	/** @type {ComponentModel} */
	const el = assign(elem(name, scope), componentMixin);
	const { props, state } = definition;

	el.props = props && props(el) || {};
	el.state = state && state(el) || {};
	el.refs = {};
}

/**
 * @type {ComponentModel}
 */
const componentMixin = {
	getProps() {
		return this.props;
	},

	setProps(value) {
		this.props = assign(this.props || {}, value);
		this.render();
	},

	getState() {
		return this.state;
	},

	setState(value) {
		this.state = assign(this.state || {}, value);
		this.render();
	},

	render() {
		// TODO implement
	},

	on(type, listener, options) {
		this.componentView.addEventListener(type, listener, options);
		return this;
	},

	off(type, listener, options) {
		this.componentView.removeEventListener(type, listener, options);
		return this;
	},

	emit(event, detail) {
		if (typeof event === 'string') {
			event = new CustomEvent(event, {
				bubbles: true,
				cancelable: true,
				composed: true,
				detail
			});
		}

		this.dispatchEvent(event);
		return this;
	}
};
