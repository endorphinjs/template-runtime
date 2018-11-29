import {
	createInjector, mountBlock, updateBlock, renderSlot, setAttribute,
	elemWithText, elem, insert, createComponent, mountComponent, updateComponent,
	getProp, mountIterator, updateIterator
} from '../../runtime';

export default function template(component) {
	const injector = createInjector(component.componentView);

	insert(injector, elemWithText('h1', 'Hello world'));
	const subComponent = insert(injector, createComponent('sub-component', { default: subComponentTemplate }, component));
	const subInjector = subComponent.componentModel.input;

	setAttribute(subInjector, 'id', attrValue1(component));
	insert(subInjector, elemWithText('div', 'foo'));

	const block1 = mountBlock(component, subInjector, ifBlock1);
	const block2 = mountBlock(component, subInjector, ifBlock2);
	const iter1 = mountIterator(component, subInjector, forEachExpr1, forEachBody1);
	const block3 = mountBlock(component, subInjector, ifBlock3);

	// TODO think about proper component rendering contract
	mountComponent(subComponent);

	return () => {
		setAttribute(subInjector, 'id', attrValue1(component));
		updateBlock(block1);
		updateBlock(block2);
		updateIterator(iter1);
		updateBlock(block3);
		updateComponent(subComponent);
	};
}

function subComponentTemplate(component) {
	const injector = createInjector(component.componentView);

	const elem1 = insert(injector, elem('div'));
	elem1.setAttribute('class', 'container');

	const injector2 = createInjector(elem1);
	const slot1 = insert(injector2, elem('slot'));
	slot1.setAttribute('name', 'header');
	const injector3 = createInjector(slot1);
	const block1 = mountBlock(component, injector3, slotBlock1);
	insert(injector2, elemWithText('p', 'content'));

	const slot2 = insert(injector2, elem('slot'));
	renderSlot(slot2, component.slots);

	const block2 = mountBlock(component, injector2, ifBlock4);
	const block3 = mountBlock(component, injector2, ifBlock5);

	return () => {
		updateBlock(block1);
		renderSlot(slot2, component.slots);
		updateBlock(block2);
		updateBlock(block3);
	};
}

function attrValue1(scope) {
	return getProp(scope, 'id');
}

function ifBlock1(scope) {
	if (getProp(scope, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	insert(injector, elemWithText('p', 'bar'));
}

function ifBlock2(scope) {
	if (getProp(scope, 'c2')) {
		return ifContent2;
	}
}

function ifContent2(scope, injector) {
	const elem = insert(injector, elemWithText('p', 'bar'), 'header');
	elem.setAttribute('slot', 'header');
}

function ifBlock3(scope) {
	if (getProp(scope, 'error')) {
		return ifContent3;
	}
}

function ifContent3(scope, injector) {
	const elem = insert(injector, elemWithText('div', 'Got error'), 'error');
	elem.setAttribute('slot', 'error');
}

function ifBlock4(scope) {
	if (getProp(scope, 'showError')) {
		return ifContent4;
	}
}

function ifContent4(host, injector) {
	const elem = insert(injector, elem('slot'));
	elem.setAttribute('slot', 'error');
	renderSlot(elem, host.slots);
	// NB: no default value in slot, no need to update anything
}

function ifBlock5(host) {
	if (getProp(host, 'showFooter')) {
		return ifContent5;
	}
}

function ifContent5(host, injector) {
	const slot = insert(injector, elem('slot'));
	slot.setAttribute('name', 'footer');
	const injector2 = createInjector(slot);
	const block1 = mountBlock(host, injector2, slotBlock2);

	return () => {
		updateBlock(block1);
	};
}

function forEachExpr1(host) {
	return getProp(host, 'items');
}

function forEachBody1(host, injector) {
	insert(injector, elemWithText('div', 'item'));
	const slot = insert(injector, elemWithText('div', 'item footer'), 'footer');
	slot.setAttribute('slot', 'footer');
}

function slotBlock1(host, injector) {
	if (!renderSlot(injector.parentNode, host.slots)) {
		return slotContent1;
	}
}

function slotContent1(host, injector) {
	insert(injector, elemWithText('h2', 'Default header'));
}

function slotBlock2(host, injector) {
	if (!renderSlot(injector.parentNode, host.slots)) {
		return slotContent2;
	}
}

function slotContent2(host, injector) {
	insert(injector, elemWithText('footer', 'Default footer'));
}
