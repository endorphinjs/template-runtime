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

	// <attribute if="..."> is the same as <if test="..."><attribute /></if>
	const block1 = renderBlock(scope, injector, ifBlock1);
	const block2 = renderBlock(scope, injector, ifBlock2);
	const block3 = renderBlock(scope, injector, ifBlock3);
	const attr4 = renderAttribute(scope, injector, 'a3', '4');

	return () => {
		attr1();
		block1();
		block2();
		block3();
		attr4();
	};
}

function ifBlock1(scope) {
	if (getProp(scope, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	renderAttribute(scope, injector, 'a2', '1');
}

function ifBlock2(scope) {
	if (getProp(scope, 'c2')) {
		return ifContent2;
	}
}

function ifContent2(scope, injector) {
	renderAttribute(scope, injector, 'a2', '2');
}

function ifBlock3(scope) {
	if (getProp(scope, 'c3')) {
		return ifContent3;
	}
}

function ifContent3(scope, injector) {
	renderAttribute(scope, injector, 'a2', '3');
	renderAttribute(scope, injector, 'a1', '3');
	renderAttribute(scope, injector, 'a3', '3');
}

function attrValue1(scope) {
	return getProp(scope, 'id');
}
