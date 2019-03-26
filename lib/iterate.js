import { run, injectBlock, disposeBlock } from './injector';
import { setScope, getScope } from './scope';
import { obj } from './utils';

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
function iteratorHost(host, injector, block) {
	block.index = 0;
	block.updated = 0;
	const collection = block.get(host, block.scope);
	if (collection && typeof collection.forEach === 'function') {
		collection.forEach(iterator, block);
	}

	trimIteratorItems(block);
}

/**
 * @param {*} scope
 * @param {number} index
 * @param {*} key
 * @param {*} value
 */
export function prepareScope(scope, index, key, value) {
	scope.index = index;
	scope.key = key;
	scope.value = value;
	return scope;
}

/**
 * Removes remaining iterator items from current context
 * @param {IteratorBlock} block
 */
function trimIteratorItems(block) {
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
	const prevScope = getScope(host);

	/** @type {IteratorItemBlock} */
	let rendered = ptr.next.value;

	if (rendered.owner === this) {
		// We have rendered item, update it
		if (rendered.update) {
			const scope = prepareScope(rendered.scope, index, key, value);
			setScope(host, scope);
			if (run(rendered, rendered.update, scope)) {
				this.updated = 1;
			}
			setScope(host, prevScope);
		}
	} else {
		// Create & render new block
		const scope = prepareScope(obj(prevScope), index, key, value);

		/** @type {IteratorItemBlock} */
		rendered = injectBlock(injector, {
			$$block: true,
			host,
			injector,
			scope,
			dispose: null,
			update: undefined,
			owner: this,
			start: null,
			end: null
		});

		setScope(host, scope);
		rendered.update = run(rendered, this.body, scope);
		setScope(host, prevScope);
		this.updated = 1;
	}

	injector.ptr = rendered.end;
	this.index++;
}
