import {
	elem, elemWithText, text, insert,
	mountBlock, updateBlock, createInjector, renderSlot, getProp
} from '../../../runtime';

/**
 * @param {Component} component
 */
export default function subComponent1Template(component) {
	const target = component.element.componentView;
	const injector = createInjector(target);

	insert(injector, elemWithText('h2', 'Sub component1', component));

	const block1 = mountBlock(component, injector, ifBlock1);
	const slot1 = insert(injector, elem('slot'));
	const injector2 = createInjector(slot1);
	const block2 = mountBlock(component, injector2, slotBlock1);

	return function subComponent1Update() {
		updateBlock(block1);
		updateBlock(block2);
	};
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
	if (!renderSlot(injector.parentNode, host.element.slots)) {
		return slotContent1;
	}
}

function slotContent1(host, injector) {
	insert(injector, text('Default sub-component data'));
}
