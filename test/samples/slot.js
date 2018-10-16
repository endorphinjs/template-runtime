import {
	createInjector, renderBlock, renderSlot, renderIterator, setAttribute, finalizeAttributes,
	elemWithText, elem, insert,
	createScope, getProp
} from '../../runtime';

export default function template(component) {
	const scope = createScope(component);
	const injector = createInjector(component);

	insert(injector, elemWithText('h1', 'Hello world'));
	const subComponent = insert(injector, elem('sub-component'));
	const subInjector = createInjector(subComponent, true);
	// TODO apply multiple props to component at once
	setAttribute(subInjector, 'id', attrValue1(scope));

	insert(subInjector, elemWithText('div', 'foo'));
	const block1 = renderBlock(scope, subInjector, ifBlock1);
	const block2 = renderBlock(scope, subInjector, ifBlock2);
	const iter1 = renderIterator(scope, subInjector, forEachExpr1, forEachBody1);
	const block3 = renderBlock(scope, subInjector, ifBlock3);

	// TODO think about proper component rendering contract
	finalizeAttributes(subInjector);
	const update = subComponent.render(subInjector.slots);

	return () => {
		setAttribute(subInjector, 'id', attrValue1(scope));
		block1(),
		block2();
		iter1();
		block3();
		finalizeAttributes(subInjector);
		update();
	};
}

export function subComponentTemplate(component, slots) {
	const scope = createScope(component, slots);
	const injector = createInjector(component);

	const elem1 = insert(injector, elem('div'));
	elem1.setAttribute('class', 'container');

	const injector2 = createInjector(elem1);
	const slot1 = insert(injector2, elem('slot'));
	slot1.setAttribute('name', 'header');
	const injector3 = createInjector(slot1);
	const block1 = renderBlock(scope, injector3, slotBlock1);
	insert(injector2, elemWithText('p', 'content'));

	const slot2 = insert(injector2, elem('slot'));
	renderSlot(slot2, scope.slots);

	const block2 = renderBlock(scope, injector2, ifBlock4);
	const block3 = renderBlock(scope, injector2, ifBlock5);

	return () => {
		block1();
		renderSlot(slot2, scope.slots);
		block2();
		block3();
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

function ifContent4(scope, injector) {
	const elem = insert(injector, elem('slot'));
	elem.setAttribute('slot', 'error');
	renderSlot(elem, scope.slots);
	// NB: no default value in slot, no need to update anything
}

function ifBlock5(scope) {
	if (getProp(scope, 'showFooter')) {
		return ifContent5;
	}
}

function ifContent5(scope, injector) {
	const slot = insert(injector, elem('slot'));
	slot.setAttribute('name', 'footer');
	const injector2 = createInjector(slot);
	return renderBlock(scope, injector2, slotBlock2);
}

function forEachExpr1(scope) {
	return getProp(scope, 'items');
}

function forEachBody1(scope, injector) {
	insert(injector, elemWithText('div', 'item'));
	const slot = insert(injector, elemWithText('div', 'item footer'), 'footer');
	slot.setAttribute('slot', 'footer');
}

function slotBlock1(scope, injector) {
	if (!renderSlot(injector.parentNode, scope.slots)) {
		return slotContent1;
	}
}

function slotContent1(scope, injector) {
	insert(injector, elemWithText('h2', 'Default header'));
}

function slotBlock2(scope, injector) {
	if (!renderSlot(injector.parentNode, scope.slots)) {
		return slotContent2;
	}
}

function slotContent2(scope, injector) {
	insert(injector, elemWithText('footer', 'Default footer'));
}
