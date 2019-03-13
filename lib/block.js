import { injectBlock, emptyBlockContent, run, disposeBlock } from './injector';
import { getScope } from './scope';

/**
 * @param {Component} host
 * @param {Injector} injector
 * @param {Function} get
 * @returns {FunctionBlock}
 */
export function mountBlock(host, injector, get) {
	/** @type {FunctionBlock} */
	const block = injectBlock(injector, {
		$$block: true,
		host,
		injector,
		scope: getScope(host),
		dispose: null,
		get,
		fn: undefined,
		update: undefined,
		start: null,
		end: null
	});
	updateBlock(block);
	return block;
}

/**
 * Updated block, described in `ctx` object
 * @param {FunctionBlock} block
 * @returns {number} Returns `1` if block was updated, `0` otherwise
 */
export function updateBlock(block) {
	let updated = 0;
	const { scope } = block;
	const fn = block.get(block.host, scope);

	if (block.fn !== fn) {
		updated = 1;
		// Unmount previously rendered content
		block.fn && emptyBlockContent(block);

		// Mount new block content
		block.update = fn && run(block, fn, scope);
		block.fn = fn;
	} else if (block.update) {
		// Update rendered result
		updated = run(block, block.update, scope) ? 1 : 0;
	}

	block.injector.ptr = block.end;
	return updated;
}

/**
 * @param {FunctionBlock} block
 */
export function unmountBlock(block) {
	disposeBlock(block);
}
