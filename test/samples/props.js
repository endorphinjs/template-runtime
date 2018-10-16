import {
	createInjector, renderBlock, setAttribute, finalizeProps,
	elem, insert, createScope, getProp
} from '../../runtime';

export default function template(component) {
	const scope = createScope(component);
	const injector = createInjector(component);

	const subComponent = insert(injector, elem('sub-component'));
	const subInjector = createInjector(subComponent, true);

	setAttribute(subInjector, 'id', attrValue1(scope));
	const block1 = renderBlock(scope, subInjector, ifBlock1);
	setAttribute(subInjector, 'p3', 3);
	finalizeProps(subInjector, { p1: 1 });

	return () => {
		setAttribute(subInjector, 'id', attrValue1(scope));
		block1();
		setAttribute(subInjector, 'p3', 3);
		finalizeProps(subInjector);
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
	setAttribute(injector, 'p2', 2);
	return ifContent1;
}
