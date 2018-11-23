import {
	createInjector, elem, getProp, finalizeAttributes, setAttribute
} from '../../runtime';

export default function(component) {
	const target = component.componentView;
	const elem1 = target.appendChild(elem('main'));

	const injector = createInjector(elem1);
	setAttribute(injector, 'a1', attrValue1(component));
	setAttribute(injector, 'a2', 0);
	ifAttr1(component, injector);
	ifAttr2(component, injector);
	ifAttr3(component, injector);
	setAttribute(injector, 'a3', '4');
	finalizeAttributes(injector);

	return () => {
		setAttribute(injector, 'a1', attrValue1(component));
		setAttribute(injector, 'a2', 0);
		ifAttr1(component, injector);
		ifAttr2(component, injector);
		ifAttr3(component, injector);
		setAttribute(injector, 'a3', '4');
		finalizeAttributes(injector);
	};
}

function ifAttr1(host, injector) {
	if (getProp(host, 'c1')) {
		setAttribute(injector, 'a2', '1');
	}
}

function ifAttr2(host, injector) {
	if (getProp(host, 'c2')) {
		setAttribute(injector, 'a2', '2');
	}
}

function ifAttr3(host, injector) {
	if (getProp(host, 'c3')) {
		setAttribute(injector, 'a2', '3');
		setAttribute(injector, 'a1', '3');
		setAttribute(injector, 'a3', '3');
	}
}

function attrValue1(host) {
	return getProp(host, 'id');
}
