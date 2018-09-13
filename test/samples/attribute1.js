import { createInjector, renderBlock, elem, createScope, getProp, renderAttribute } from '../../runtime';

export default function(component, target = component) {
	const scope = createScope(component);
	const elem1 = target.appendChild(elem('main'));

	// NB any `<attribute>` instruction should promote container to injector
	// instance and render *all* element attributes as blocks to properly keep track
	// of added and removed values.
	// In compiler, we should detect if all `<attribute>` instructions use static
	// name and render only these attributes as blocks
	const injector = createInjector(elem1);
	const attr1 = renderAttribute(scope, injector, 'a1', attrValue1);
	renderAttribute(scope, injector, 'a2', '0');
	const attr2 = renderAttribute(scope, injector, 'a2', '1', attrCond1);
	const attr3 = renderAttribute(scope, injector, 'a2', '2', attrCond2);
	const block1 = renderBlock(scope, injector, ifBlock1);
	const attr4 = renderAttribute(scope, injector, 'a3', '4');

	return () => {
		attr1();
		attr2();
		attr3();
		block1();
		attr4();
	};
}

function ifBlock1(scope) {
	if (getProp(scope, 'c3')) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	renderAttribute(scope, injector, 'a2', '3');
	renderAttribute(scope, injector, 'a1', '3');
	renderAttribute(scope, injector, 'a3', '3');
}

function attrValue1(scope) {
	return getProp(scope, 'id');
}

function attrCond1(scope) {
	return getProp(scope, 'c1');
}

function attrCond2(scope) {
	return getProp(scope, 'c2');
}
