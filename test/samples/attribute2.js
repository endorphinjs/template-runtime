import {
	createInjector, elem, getProp, finalizeAttributes, setAttribute, addClass
} from '../../runtime';

export default function(component) {
	const target = component.componentView;
	const elem1 = target.appendChild(elem('main'));
	const injector = createInjector(elem1);

	setAttribute(injector, 'a1', attrValue1(component));
	elem1.setAttribute('a2', '0');

	// TODO should set class attribute once, all `addClass()` calls should
	// only add/remove class names, not replace entire class attribute
	setAttribute(injector, 'class', 'foo');

	ifAttr1(component, injector);
	ifAttr2(component, injector);
	ifAttr3(component, injector);

	addClass(injector, attrValue2(component));

	finalizeAttributes(injector);

	return () => {
		setAttribute(injector, 'a1', attrValue1(target));
		setAttribute(injector, 'class', 'foo');

		ifAttr1(target, injector);
		ifAttr2(target, injector);
		ifAttr3(target, injector);

		addClass(injector, attrValue2(component));
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
