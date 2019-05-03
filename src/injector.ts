import { createList, listInsertValueAfter, listPrependValue, listMoveFragmentAfter, listMoveFragmentFirst, listDetachFragment } from './linked-list';
import { changeSet, animatingKey } from './utils';
import { domInsert, domRemove } from './dom';
import { Injector, BaseBlock, LinkedListItem, RunCallback } from '../types';

/**
 * Creates injector instance for given target, if required
 */
export function createInjector(target: Element): Injector {
	return {
		parentNode: target,
		items: createList(),
		ctx: null,
		ptr: null,

		// NB create `slots` placeholder to promote object to hidden class.
		// Do not use any additional function argument for adding value to `slots`
		// to reduce runtime checks and keep functions in monomorphic state
		slots: null,
		attributes: changeSet(),
		events: changeSet()
	};
}

/**
 * Inserts given node into current context
 */
export function insert(injector: Injector, node: Node, slotName = ''): Node {
	let target: Node;
	const { items, slots, ptr } = injector;

	if (slots) {
		target = slots[slotName] || (slots[slotName] = document.createDocumentFragment());
	} else {
		target = injector.parentNode;
	}

	domInsert(node, target, ptr && getAnchorNode(ptr.next, target));
	injector.ptr = ptr ? listInsertValueAfter(node, ptr) : listPrependValue(items, node);

	return node;
}

/**
 * Injects given block
 * @template {BaseBlock} T
 * @param {Injector} injector
 * @param {T} block
 * @returns {T}
 */
export function injectBlock<T extends BaseBlock<any>>(injector: Injector, block: T): T {
	const { items, ptr } = injector;

	if (ptr) {
		block.end = listInsertValueAfter(block, ptr);
		block.start = listInsertValueAfter(block, ptr);
	} else {
		block.end = listPrependValue(items, block);
		block.start = listPrependValue(items, block);
	}

	injector.ptr = block.end;
	return block;
}

/**
 * Runs `fn` template function in context of given `block`
 */
export function run<U>(block: BaseBlock<any>, fn: RunCallback<U>, data?: any): U {
	const { host, injector } = block;
	const { ctx } = injector;
	injector.ctx = block;
	injector.ptr = block.start;
	const result = fn(host, injector, data);
	injector.ptr = block.end;
	injector.ctx = ctx;

	return result;
}

/**
 * Empties content of given block
 */
export function emptyBlockContent(block: BaseBlock<any>): void {
	if (block.dispose) {
		block.dispose(block.scope);
		block.dispose = null;
	}

	let item = block.start.next;
	while (item && item !== block.end) {
		// tslint:disable-next-line:prefer-const
		let { value, next, prev } = item;

		if (isBlock(value)) {
			next = value.end.next;
			disposeBlock(value);
		} else if (!value[animatingKey]) {
			domRemove(value);
		}

		prev.next = next;
		next.prev = prev;
		item = next;
	}
}

/**
 * Moves contents of `block` after `ref` list item
 */
export function move(injector: Injector, block: BaseBlock<any>, ref?: LinkedListItem<any>) {
	if (ref && ref.next && ref.next.value === block) {
		return;
	}

	// Update linked list
	const { start, end } = block;

	if (ref) {
		listMoveFragmentAfter(injector.items, start, end, ref);
	} else {
		listMoveFragmentFirst(injector.items, start, end);
	}

	// Move block contents in DOM
	let item = start.next;
	let node: Node;
	while (item !== end) {
		if (!isBlock(item.value)) {
			node = item.value;

			// NB it’s possible that a single block contains nodes from different
			// slots so we have to find anchor for each node individually
			domInsert(node, node.parentNode, getAnchorNode(end.next, node.parentNode));
		}
		item = item.next;
	}
}

/**
 * Disposes given block
 */
export function disposeBlock(block: BaseBlock<any>) {
	emptyBlockContent(block);
	listDetachFragment(block.injector.items, block.start, block.end);
	block.start = block.end = null;
}

/**
 * Check if given value is a block
 */
function isBlock(obj: any): boolean {
	return '$$block' in obj;
}

/**
 * Get DOM node nearest to given position of items list
 */
function getAnchorNode(item: LinkedListItem<any>, parent: Node): Node {
	while (item) {
		if (item.value.parentNode === parent) {
			return item.value;
		}

		item = item.next;
	}
}
