import { assign, changed } from './utils';
import { scheduleRender, renderComponent } from './component';

const prefix = '$';

export class Store {
	constructor(data = {}) {
		this.data = assign({}, data);
		/** @type {StoreUpdateEntry[]} */
		this._listeners = [];

		// For unit tests
		this.sync = false;
	}

	/**
	 * Returns current store data
	 * @returns {Object}
	 */
	get() {
		return this.data;
	}

	/**
	 * Updates data in store
	 * @param {Object} data
	 */
	set(data) {
		const updated = changed(data, this.data, prefix);
		const render = this.sync ? renderComponent : scheduleRender;

		if (updated) {
			const next = this.data = assign(this.data, data);
			// Notify listeners.
			// Run in reverse order for listener safety (in case if handler decides
			// to unsubscribe during notification)
			for (let i = this._listeners.length - 1, item; i >= 0; i--) {
				item = this._listeners[i];
				if (!item.keys || !item.keys.length || hasChange(item.keys, updated)) {
					if ('component' in item) {
						render(item.component, updated);
					} else if ('handler' in item) {
						item.handler(next, updated);
					}
				}
			}
		}
	}

	/**
	 * Subscribes to changes in given store
	 * @param {StoreUpdateHandler} handler Function to invoke when store changes
	 * @param {string[]} keys Run handler only if given top-level keys are changed
	 * @returns {Object} Object that should be used to unsubscribe from updates
	 */
	subscribe(handler, keys) {
		/** @type {StoreUpdateEntry} */
		const obj = {
			handler,
			keys: scopeKeys(keys, prefix)
		};
		this._listeners.push(obj);
		return obj;
	}

	/**
	 * Unsubscribes from further updates
	 * @param {Object} obj
	 */
	unsubscribe(obj) {
		const ix = this._listeners.indexOf(obj);
		if (ix !== -1) {
			this._listeners.splice(ix, 1);
		}
	}

	/**
	 * Watches for updates of given `keys` in store and runs `component` render on change
	 * @param {Component} component
	 * @param {string[]} keys
	 */
	watch(component, keys) {
		this._listeners.push({
			component,
			keys: scopeKeys(keys, prefix)
		});
	}

	/**
	 * Stops watching for store updates for given component
	 * @param {Component} component
	 */
	unwatch(component) {
		for (let i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].component === component) {
				this._listeners.splice(i, 1);
				return;
			}

		}
	}
}

/**
 * Check if any of `keys` was changed in `next` object since `prev` state
 * @param {string[]} keys
 * @param {Object} updated
 * @return {boolean}
 */
function hasChange(keys, updated) {
	for (let i = 0; i < keys.length; i++) {
		if (keys[i] in updated) {
			return true;
		}
	}

	return false;
}

/**
 * Adds given prefix to keys
 * @param {string[]} keys
 * @param {string} prefix
 * @returns {string[]}
 */
function scopeKeys(keys, prefix) {
	return keys && prefix ? keys.map(key => prefix + key) : keys;
}
