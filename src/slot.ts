import { moveContents } from './utils';
import { createInjector } from './injector';
import { mountBlock, updateBlock, unmountBlock } from './block';
import { runHook } from './hooks';
import { Component, SlotContext, RenderMount, RenderUpdate, FunctionBlock, Injector } from '../types';

/**
 * Registers given element as output slot for `host` component
 * @param defaultContent Function for rendering default slot content
 */
export function mountSlot(host: Component, name: string, elem: HTMLElement, defaultContent?: RenderUpdate): SlotContext {
	const ctx: SlotContext = { host, name, defaultContent, isDefault: false };
	const { slots } = host.componentModel;
	const injector = createInjector(elem);

	const blockEntry: RenderMount = () => {
		ctx.isDefault = !renderSlot(host, injector);
		return ctx.isDefault ? ctx.defaultContent : null;
	};

	slots[name] = mountBlock(host, injector, blockEntry);

	return ctx;
}

/**
 * Unmounts given slot
 * @param {SlotContext} ctx
 */
export function unmountSlot(ctx: SlotContext) {
	const { host, name } = ctx;
	const { slots } = host.componentModel;

	if (ctx.isDefault) {
		unmountBlock(slots[name] as FunctionBlock);
	}

	ctx.defaultContent = null;
	delete slots[name];
}

/**
 * Sync slot content if necessary
 */
export function updateSlots(host: Component) {
	const { slots, slotStatus, input } = host.componentModel;
	for (const name in slots) {
		updateBlock(slots[name] as FunctionBlock);
	}

	for (const name in slotStatus) {
		if (slotStatus[name]) {
			runHook(host, 'didSlotUpdate', name, input.slots[name]);
			slotStatus[name] = 0;
		}
	}
}

/**
 * Renders incoming contents of given slot
 * @returns Returns `true` if slot content was filled with incoming data,
 * `false` otherwise
 */
function renderSlot(host: Component, target: Injector): boolean {
	const { parentNode } = target;
	const name = parentNode.getAttribute('name') || '';
	const slotted = parentNode.hasAttribute('slotted');
	const { input } = host.componentModel;
	const source: Element | DocumentFragment = input.slots[name];

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
 */
export function markSlotUpdate(component: Component, slotName: string, status: number) {
	const { slotStatus } = component.componentModel;
	if (slotName in slotStatus) {
		slotStatus[slotName] |= status;
	} else {
		slotStatus[slotName] = status;
	}
}
