import {
	createInjector, elem, createScope, getProp,
	beginAttributes, finalizeAttributes, setAttribute
} from '../../runtime';

export default function(component, target = component) {
	const scope = createScope(component);
	const elem1 = target.appendChild(elem('main'));

	const injector = createInjector(elem1);
	beginAttributes(injector);
	setAttribute(injector, 'a1', attrValue1(scope));
	setAttribute(injector, 'a2', 0);
	ifAttr1(scope, injector);
	ifAttr2(scope, injector);
	ifAttr3(scope, injector);
	setAttribute(injector, 'a3', '4');
	finalizeAttributes(injector);

	return () => {
		beginAttributes(injector);
		setAttribute(injector, 'a1', attrValue1(scope));
		setAttribute(injector, 'a2', 0);
		ifAttr1(scope, injector);
		ifAttr2(scope, injector);
		ifAttr3(scope, injector);
		setAttribute(injector, 'a3', '4');
		finalizeAttributes(injector);
	};
}

function ifAttr1(scope, injector) {
	if (getProp(scope, 'c1')) {
		setAttribute(injector, 'a2', '1');
	}
}

function ifAttr2(scope, injector) {
	if (getProp(scope, 'c2')) {
		setAttribute(injector, 'a2', '2');
	}
}

function ifAttr3(scope, injector) {
	if (getProp(scope, 'c3')) {
		setAttribute(injector, 'a2', '3');
		setAttribute(injector, 'a1', '3');
		setAttribute(injector, 'a3', '3');
	}
}

function attrValue1(scope) {
	return getProp(scope, 'id');
}
