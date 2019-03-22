import { unmountComponent } from './component';
import { domRemove } from './dom';
import { animatingKey } from './utils';

/**
 * Animates element appearance
 * @param {HTMLElement | Component} elem
 * @param {string} animation
 * @param {string} [cssScope]
 */
export function animateIn(elem, animation, cssScope) {
	if (animation = createAnimation(animation, cssScope)) {
		elem.style.animation = animation;
	}
}

/**
 * Animates element disappearance
 * @param {HTMLElement | Component} elem
 * @param {string} animation
 * @param {Function} [callback]
 * @param {string} [cssScope]
 */
export function animateOut(elem, animation, callback, cssScope) {
	if (typeof callback === 'string') {
		cssScope = callback;
		callback = null;
	}

	if (animation = createAnimation(animation, cssScope)) {
		/** @param {AnimationEvent} evt */
		const handler = evt => {
			if (evt.target === elem) {
				elem[animatingKey] = false;
				elem.removeEventListener('animationend', handler);
				elem.removeEventListener('animationcancel', handler);
				dispose(elem, callback);
			}
		};

		elem[animatingKey] = true;
		elem.addEventListener('animationend', handler);
		elem.addEventListener('animationcancel', handler);
		elem.style.animation = animation;
	} else {
		dispose(elem, callback);
	}
}

/**
 * Creates animation CSS value with scoped animation name
 * @param {string} animation
 * @param {string} [cssScope]
 * @returns {string}
 */
function createAnimation(animation, cssScope) {
	if (animation == null) {
		return '';
	}

	const parts = String(animation).split(' ');
	let name = parts[0].trim();
	const globalPrefix = 'global:';

	if (name.indexOf(globalPrefix) === 0) {
		// Do not scope animation name, use globally defined animation name
		parts[0] = name.slice(globalPrefix.length);
	} else if (cssScope) {
		parts[0] = concat(name, cssScope);
	}

	return parts.join(' ').trim();
}

/**
 * Concatenates two strings with optional separator
 * @param {string} name
 * @param {string} suffix
 */
function concat(name, suffix) {
	const sep = suffix[0] === '_' || suffix[0] === '-' ? '' : '-';
	return name + sep + suffix;
}

/**
 * @param {HTMLElement | Component} elem
 * @param {Function} [callback]
 */
function dispose(elem, callback) {
	if (/** @type {Component} */ (elem).componentModel) {
		unmountComponent(/** @type {Component} */(elem));
	}

	if (callback) {
		callback();
	}

	domRemove(elem);
}
