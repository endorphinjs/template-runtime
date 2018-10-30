import { elem } from './dom';
import { assign } from './utils';
import { finalizeEvents } from './event';
import { finalizeRefs } from './ref';
import { finalizeProps } from './attribute';


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
 * Finalizes given component
 * @param {Scope} scope
 * @param {Injector} injector
 * @param {object} initialProps
 */
export function finalizeComponent(scope, injector, initialProps) {
	finalizeEvents(injector);
	if (finalizeProps(injector, initialProps)) {
		injector.parentNode.render(injector.slots);
	}
}

/**
 * @type {ComponentModel}
 */
const componentMixin = {
	getProps() {
		return this.props;
	},

	setProps(value, silent) {
		this.props = assign(this.props || {}, value);
		if (!silent) {
			this.render();
		}
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
