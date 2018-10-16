import {
	createInjector, elem, createScope, getProp,
	finalizeAttributes, setAttribute, addClass
} from '../../runtime';

export default function(component) {
	const scope = createScope(component);
	const elem1 = component.appendChild(elem('main'));
	const injector = createInjector(elem1);

	setAttribute(injector, 'a1', attrValue1(scope));
	elem1.setAttribute('a2', '0');
	setAttribute(injector, 'class', 'foo');

	ifAttr1(scope, injector);
	ifAttr2(scope, injector);
	ifAttr3(scope, injector);

	addClass(injector, attrValue2(scope));

	finalizeAttributes(scope, injector);

	return () => {
		setAttribute(injector, 'a1', attrValue1(scope));
		setAttribute(injector, 'class', 'foo');

		ifAttr1(scope, injector);
		ifAttr2(scope, injector);
		ifAttr3(scope, injector);

		addClass(injector, attrValue2(scope));
		finalizeAttributes(scope, injector);
	};
}

function ifAttr1(scope, injector) {
	if (getProp(scope, 'c1')) {
		setAttribute(injector, 'a2', '1');
	}
}

function ifAttr2(scope, injector) {
	if (getProp(scope, 'c2')) {
		addClass(injector, 'foo bar');
	}
}

function ifAttr3(scope, injector) {
	if (getProp(scope, 'c3')) {
		setAttribute(injector, 'class', attrValue3(scope));
	}
}

function attrValue1(scope) {
	return getProp(scope, 'id');
}

function attrValue2(scope) {
	return getProp(scope, 'classAddon');
}

function attrValue3(scope) {
	return 'bam ' + getProp(scope, 'id');
}
