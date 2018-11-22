import {
	elemWithText, text, insert, setAttribute, getProp,
	createComponent, mountComponent, updateComponent, createInjector,
	mountBlock, updateBlock
} from '../../../runtime';

import * as SubComponent1 from './sub-component1';
import * as SubComponent2 from './sub-component2';

/**
 * @param {Component} component
 */
export default function myComponentTemplate(component) {
	const target = component.element.componentView;
	const injector = createInjector(target);

	insert(injector, elemWithText('h1', 'Title', component));

	const subComponent1 = createComponent('sub-component1', SubComponent1, component);
	const injector2 = subComponent1.input;
	setAttribute(injector2, 'foo', attrValue1(component));
	insert(injector, subComponent1.element);

	const block1 = mountBlock(component, injector2, ifBlock1);

	mountComponent(subComponent1);

	return function myComponentUpdate() {
		setAttribute(injector2, 'foo', attrValue1(component));
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

function ifContent1(host, injector) {
	const subComponent2 = createComponent('sub-component2', SubComponent2, host);
	const injector2 = subComponent2.input;
	setAttribute(injector2, 'bar', attrValue2(host));
	insert(injector, subComponent2.element);
	insert(injector2, text('Hello world'));

	mountComponent(subComponent2);

	return () => {
		setAttribute(injector2, 'bar', attrValue2(host));
		updateComponent(subComponent2);
	};
}

function attrValue1(host) {
	return getProp(host, 'value1');
}

function attrValue2(host) {
	return getProp(host, 'value2');
}
