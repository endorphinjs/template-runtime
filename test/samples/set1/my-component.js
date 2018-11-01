import {
	elemWithText, text, insert, setAttribute, getProp,
	createComponent, mountComponent, updateComponent, createInjector,
	mountBlock, updateBlock
} from '../../../runtime';

import * as SubComponent1 from './sub-component1';
import * as SubComponent2 from './sub-component2';

/**
 * @param {ComponentContainer} component
 */
export default function myComponentTemplate(component) {
	const target = component.element.componentView;
	const injector = createInjector(target);
	const { scope } = component;
	const cssScope = scope.css;

	insert(injector, elemWithText('h1', 'Title', cssScope));

	const subComponent1 = createComponent('sub-component1', SubComponent1, cssScope);
	const injector2 = subComponent1.injector;
	setAttribute(injector2, 'foo', attrValue1(scope));
	insert(injector, subComponent1.element);

	const block1 = mountBlock(scope, injector2, ifBlock1);

	mountComponent(subComponent1);

	return function myComponentUpdate() {
		setAttribute(injector2, 'foo', attrValue1(scope));
		updateBlock(block1);
		updateComponent(subComponent1);
	};
}

export function props() {
	return {
		value1: 1,
		value2: 2
	};
}

function ifBlock1(scope) {
	if (getProp(scope, 'value1') > 0) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	const cssScope = scope.css;

	const subComponent2 = createComponent('sub-component2', SubComponent2, cssScope);
	const injector2 = subComponent2.injector;
	setAttribute(injector2, 'bar', attrValue2(scope));
	insert(injector, subComponent2.element);
	insert(injector2, text('Hello world'));

	mountComponent(subComponent2);

	return () => {
		setAttribute(injector2, 'bar', attrValue2(scope));
		updateComponent(subComponent2);
	};
}

function attrValue1(scope) {
	return getProp(scope, 'value1');
}

function attrValue2(scope) {
	return getProp(scope, 'value2');
}
