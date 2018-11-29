import {
	createInjector, setAttribute, mountBlock, updateBlock,
	insert, getProp, createComponent, mountComponent, updateComponent
} from '../../runtime';

import * as SubComponent1 from './set1/sub-component1';

export default function template(component) {
	const injector = createInjector(component.componentView);

	const subComponent = createComponent('sub-component', SubComponent1, component);
	insert(injector, subComponent);
	const subInjector = subComponent.componentModel.input;

	setAttribute(subInjector, 'p1', 1);
	setAttribute(subInjector, 'id', attrValue1(component));
	const block1 = mountBlock(component, subInjector, ifBlock1);
	setAttribute(subInjector, 'p3', 3);
	mountComponent(subComponent);

	return () => {
		setAttribute(subInjector, 'p1', 1);
		setAttribute(subInjector, 'id', attrValue1(component));
		updateBlock(block1);
		setAttribute(subInjector, 'p3', 3);
		updateComponent(subComponent);
	};
}

function attrValue1(host) {
	return getProp(host, 'id');
}

function ifBlock1(host) {
	if (getProp(host, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(host, injector) {
	setAttribute(injector, 'p2', 2);
	return ifContent1;
}
