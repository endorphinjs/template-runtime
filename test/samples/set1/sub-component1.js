import {
	elem, elemWithText, text, insert,
	mountBlock, updateBlock, createInjector, renderSlot, getProp
} from '../../../runtime';

/**
 * @param {Component} host
 */
export default function subComponent1Template(host, scope) {
	const target = host.componentView;
	const injector = createInjector(target);

	insert(injector, elemWithText('h2', 'Sub component1', host));

	scope.block1 = mountBlock(host, injector, ifBlock1);
	const slot1 = insert(injector, elem('slot'));
	const injector2 = createInjector(slot1);
	scope.block2 = mountBlock(host, injector2, slotBlock1);

	return subComponent1Update;
}

function subComponent1Update(host, scope) {
	updateBlock(scope.block1);
	updateBlock(scope.block2);
}

function ifBlock1(host) {
	if (getProp(host, 'foo') === 1) {
		return ifContent1;
	}
}

function ifContent1(host, injector) {
	insert(injector, elemWithText('p', 'foo enabled', host));
}

function slotBlock1(host, injector) {
	if (!renderSlot(injector.parentNode, host.slots)) {
		return slotContent1;
	}
}

function slotContent1(host, injector) {
	insert(injector, text('Default sub-component data'));
}
