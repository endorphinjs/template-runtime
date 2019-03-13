import { run, injectBlock, disposeBlock } from './injector';
import { enterScope, exitScope, setScope, getScope } from './scope';
import { assign } from './utils';

/**
 * Mounts iterator block
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get A function that returns collection to iterate
 * @param {Function} body A function that renders item of iterated collection
 * @returns {IteratorBlock}
 */
export function mountIterator(host, injector, get, body) {
	/** @type {IteratorBlock} */
	const block = injectBlock(injector, {
		$$block: true,
		host,
		injector,
		scope: getScope(host),
		dispose: null,
		get,
		body,
		index: 0,
		updated: 0,
		start: null,
		end: null
	});
	updateIterator(block);
	return block;
}

/**
 * Updates iterator block defined in `ctx`
 * @param {IteratorBlock} block
 * @returns {number} Returns `1` if iterator was updated, `0` otherwise
 */
export function updateIterator(block) {
	run(block, iteratorHost, block);
	return block.updated;
}

/**
 * @param {IteratorBlock} block
 */
export function unmountIterator(block) {
	disposeBlock(block);
}

/**
 *
 * @param {Component} host
 * @param {Injector} injector
 * @param {IteratorBlock} block
 */
export function iteratorHost(host, injector, block) {
	block.index = 0;
	block.updated = 0;
	const collection = block.get(host, block.scope);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, block);
	}

	trimIteratorItems(block);
}

/**
 * Removes remaining iterator items from current context
 * @param {IteratorBlock} block
 */
export function trimIteratorItems(block) {
	/** @type {LinkedListItem<IteratorItemBlock>} */
	let item = block.injector.ptr.next, listItem;
	while (item.value.owner === block) {
		block.updated = 1;
		listItem = item.value;
		item = listItem.end.next;
		disposeBlock(listItem);
	}
}

/**
 * @this {IteratorBlock}
 * @param {*} value
 * @param {*} key
 */
function iterator(value, key) {
	const { host, injector, index } = this;
	const { ptr } = injector;
	const localScope = { index, key, value };

	/** @type {IteratorItemBlock} */
	let rendered = ptr.next.value;

	if (rendered.owner === this) {
		// We have rendered item, update it
		if (rendered.update) {
			setScope(host, assign(rendered.scope, localScope));
			if (run(rendered, rendered.update, rendered.scope)) {
				this.updated = 1;
			}
			exitScope(host);
		}
	} else {
		// Create & render new block
		/** @type {IteratorItemBlock} */
		rendered = injectBlock(injector, {
			$$block: true,
			host,
			injector,
			scope: enterScope(host, localScope),
			dispose: null,
			update: undefined,
			owner: this,
			start: null,
			end: null
		});

		rendered.update = run(rendered, this.body, rendered.scope);
		exitScope(host);
		this.updated = 1;
	}

	injector.ptr = rendered.end;
	this.index++;
}
