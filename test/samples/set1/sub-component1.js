import {
	elem, elemWithText, text, insert,
	mountBlock, updateBlock, createInjector, renderSlot, getProp
} from '../../../runtime';

/**
 * @param {ComponentContainer} component
 */
export default function subComponent1Template(component) {
	const target = component.element.componentView;
	const injector = createInjector(target);
	const { scope } = component;
	const cssScope = scope.css;

	insert(injector, elemWithText('h2', 'Sub component1', cssScope));

	const block1 = mountBlock(scope, injector, ifBlock1);
	const slot1 = insert(injector, elem('slot'));
	const injector2 = createInjector(slot1);
	const block2 = mountBlock(scope, injector2, slotBlock1);

	return function subComponent1Update() {
		updateBlock(block1);
		updateBlock(block2);
	};
}

function ifBlock1(scope) {
	if (getProp(scope, 'foo') === 1) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	const cssScope = scope.css;
	insert(injector, elemWithText('p', 'foo enabled', cssScope));
}

function slotBlock1(scope, injector) {
	if (!renderSlot(injector.parentNode, scope.element.slots)) {
		return slotContent1;
	}
}

function slotContent1(scope, injector) {
	insert(injector, text('Default sub-component data'));
}
