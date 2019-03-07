import { moveContents } from './utils';
import { createInjector } from './injector';
import { mountBlock, updateBlock, unmountBlock } from './block';
import { runHook } from './hooks';

/**
 * Registers given element as output slot for `host` component
 * @param {Component} host
 * @param {string} name
 * @param {HTMLElement} elem
 * @param {Function} [defaultContent] Function for rendering default slot content
 * @return {SlotContext}
 */
export function mountSlot(host, name, elem, defaultContent) {
	/** @type {SlotContext} */
	const ctx = { host, name, defaultContent, isDefault: false };
	const { slots } = host.componentModel;

	/**
	 * @param {Component} host
	 * @param {Object} scope
	 * @param {Injector} injector
	 */
	function blockEntry(host, scope, injector) {
		ctx.isDefault = !renderSlot(host, injector);
		return ctx.isDefault ? ctx.defaultContent : null;
	}

	slots[name] = mountBlock(host, createInjector(elem), blockEntry);

	return ctx;
}

/**
 * Unmounts given slot
 * @param {SlotContext} ctx
 */
export function unmountSlot(ctx) {
	const { host, name } = ctx;
	const { slots } = host.componentModel;

	if (ctx.isDefault) {
		unmountBlock(slots[name]);
	}

	ctx.defaultContent = null;
	delete slots[name];
}

/**
 * Sync slot content if necessary
 * @param {Component} host
 */
export function updateSlots(host) {
	const { slots, slotStatus, input } = host.componentModel;
	for (const name in slots) {
		updateBlock(slots[name]);
	}

	for (const name in slotStatus) {
		if (slotStatus[name]) {
			runHook(host, 'didSlotUpdate', [name, input.slots[name]]);
			slotStatus[name] = 0;
		}
	}
}

/**
 * Renders incoming contents of given slot
 * @param {Component} host
 * @param {Injector} target
 * @returns {boolean} Returns `true` if slot content was filled with incoming data,
 * `false` otherwise
 */
function renderSlot(host, target) {
	const { parentNode } = target;
	const name = parentNode.getAttribute('name') || '';
	const slotted = parentNode.hasAttribute('slotted');
	const { input } = host.componentModel;
	/** @type {Element | DocumentFragment} */
	const source = input.slots[name];

	if (source && source.childNodes.length) {
		// There’s incoming slot content
		if (!slotted) {
			parentNode.setAttribute('slotted', '');
			input.slots[name] = moveContents(source, parentNode);
		}

		return true;
	}

	if (slotted) {
		// Parent renderer removed incoming data
		parentNode.removeAttribute('slotted');
		input[name] = null;
	}

	return false;
}

/**
 * Marks slot update status
 * @param {Component} component
 * @param {string} slotName
 * @param {number} status
 */
export function markSlotUpdate(component, slotName, status) {
	const { slotStatus } = component.componentModel;
	if (slotName in slotStatus) {
		slotStatus[slotName] |= status;
	} else {
		slotStatus[slotName] = status;
	}
}
