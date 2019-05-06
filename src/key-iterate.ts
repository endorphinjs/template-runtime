import { run, move, injectBlock, disposeBlock } from './injector';
import { setScope, getScope } from './scope';
import { obj } from './utils';
import { prepareScope } from './iterate';
import { Component, Injector, KeyIteratorBlock, IteratorItemBlock, RenderItems, KeyExpr, MountBlock } from '../types';

/**
 * Renders key iterator block
 */
export function mountKeyIterator(host: Component, injector: Injector, get: RenderItems, keyExpr: KeyExpr, body: MountBlock): KeyIteratorBlock {
	const parentScope = getScope(host);
	const block: KeyIteratorBlock = injectBlock(injector, {
		$$block: true,
		host,
		injector,
		scope: obj(parentScope),
		dispose: null,
		get,
		body,
		keyExpr,
		index: 0,
		updated: 0,
		rendered: null,
		needReorder: false,
		parentScope,
		order: [],
		used: null,
		start: null,
		end: null
	});
	updateKeyIterator(block);
	return block;
}

/**
 * Updates iterator block defined in `ctx`
 * @returns Returns `1` if iterator was updated, `0` otherwise
 */
export function updateKeyIterator(block: KeyIteratorBlock): number {
	run(block, keyIteratorHost, block);
	return block.updated;
}

export function unmountKeyIterator(ctx: KeyIteratorBlock) {
	disposeBlock(ctx);
}

function keyIteratorHost(host: Component, injector: Injector, block: KeyIteratorBlock) {
	block.used = obj();
	block.index = 0;
	block.updated = 0;
	block.needReorder = false;

	const collection = block.get(host, block.parentScope);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, block);
	}

	const { rendered } = block;
	for (const p in rendered) {
		for (let i = 0, items = rendered[p]; i < items.length; i++) {
			block.updated = 1;
			disposeBlock(items[i]);
		}
	}

	if (block.needReorder) {
		reorder(block);
	}

	block.order.length = 0;
	block.rendered = block.used;
}

/**
 * @param {IteratorItemBlock} expected
 * @param {KeyIteratorBlock} owner
 * @returns {IteratorItemBlock | null}
 */
function getItem(expected: IteratorItemBlock, owner: KeyIteratorBlock): IteratorItemBlock | null {
	return expected.owner === owner ? expected : null;
}

function iterator(this: KeyIteratorBlock, value: any, key: any) {
	const { host, injector, index, rendered } = this;
	const id = getId(this, index, key, value);
	// TODO make `rendered` a linked list for faster insert and remove
	let entry = rendered && id in rendered ? rendered[id].shift() : null;

	const prevScope = getScope(host);
	const scope = prepareScope(entry ? entry.scope : obj(this.scope), index, key, value);
	setScope(host, scope);

	if (!entry) {
		entry = injector.ctx = createItem(this, scope);
		injector.ptr = entry.start;
		entry.update = this.body(host, injector, scope);
		this.updated = 1;
	} else if (entry.update) {
		if (entry.start.prev !== injector.ptr) {
			this.needReorder = true;
		}

		if (entry.update(host, injector, scope)) {
			this.updated = 1;
		}
	}

	setScope(host, prevScope);

	markUsed(this, id, entry);
	injector.ptr = entry.end;
	this.index++;
}

function reorder(block: KeyIteratorBlock) {
	const { injector, order } = block;
	let actualPrev: IteratorItemBlock | null;
	let actualNext: IteratorItemBlock | null;
	let expectedPrev: IteratorItemBlock | null;
	let expectedNext: IteratorItemBlock | null;

	for (let i = 0, maxIx = order.length - 1, item: IteratorItemBlock; i <= maxIx; i++) {
		item = order[i];
		expectedPrev = i > 0 ? order[i - 1] : null;
		expectedNext = i < maxIx ? order[i + 1] : null;
		actualPrev = getItem(item.start.prev.value, block);
		actualNext = getItem(item.end.next.value, block);

		if (expectedPrev !== actualPrev && expectedNext !== actualNext) {
			// Blocks must be reordered
			move(injector, item, expectedPrev ? expectedPrev.end : block.start);
		}
	}
}

function markUsed(iter: KeyIteratorBlock, id: string, block: IteratorItemBlock) {
	const { used } = iter;
	// We allow multiple items key in case of poorly prepared data.
	if (id in used) {
		used[id].push(block);
	} else {
		used[id] = [block];
	}

	iter.order.push(block);
}

function getId(iter: KeyIteratorBlock, index: number, key: any, value: any): string {
	return iter.keyExpr(value, prepareScope(iter.scope, index, key, value));
}

function createItem(iter: KeyIteratorBlock, scope: object): IteratorItemBlock {
	return injectBlock(iter.injector, {
		$$block: true,
		host: iter.host,
		injector: iter.injector,
		scope,
		dispose: null,
		update: undefined,
		owner: iter,
		start: null,
		end: null
	});
}
