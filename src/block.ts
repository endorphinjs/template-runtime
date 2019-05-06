import { injectBlock, emptyBlockContent, run, disposeBlock } from './injector';
import { getScope } from './scope';
import { Component, Injector, FunctionBlock, GetMount } from '../types';

export function mountBlock(host: Component, injector: Injector, get: GetMount): FunctionBlock {
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
	}) as FunctionBlock;
	updateBlock(block);
	return block;
}

/**
 * Updated block, described in `ctx` object
 * @returns Returns `1` if block was updated, `0` otherwise
 */
export function updateBlock(block: FunctionBlock): number {
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

export function unmountBlock(block: FunctionBlock) {
	disposeBlock(block);
}
