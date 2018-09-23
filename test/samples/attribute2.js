import {
	createInjector, renderBlock, elem, createScope, getProp,
	beginAttributes, finalizeAttributes, renderAttribute, renderAttributeDynValue,
	renderAddClass
} from '../../runtime';
import { renderAddClassDyn } from '../../lib/attribute';

export default function(component, target = component) {
	const scope = createScope(component);
	const elem1 = target.appendChild(elem('main'));

	const injector = createInjector(elem1);
	beginAttributes(injector);
	const attr1 = renderAttributeDynValue(scope, injector, 'a1', attrValue1);
	renderAttribute(injector, 'a2', 0);
	const attr2 = renderAttribute(injector, 'class', 'foo');

	const block1 = renderBlock(scope, injector, ifBlock1);
	const block2 = renderBlock(scope, injector, ifBlock2);
	const block3 = renderBlock(scope, injector, ifBlock3);
	const attr3 = renderAddClassDyn(scope, injector, attrValue2);
	finalizeAttributes(injector);

	return () => {
		beginAttributes(injector);
		attr1();
		attr2();
		block1();
		block2();
		block3();
		attr3();
		finalizeAttributes(injector);
	};
}

function ifBlock1(scope) {
	if (getProp(scope, 'c1')) {
		return ifContent1;
	}
}

function ifContent1(scope, injector) {
	return renderAttribute(injector, 'a2', '1');
}

function ifBlock2(scope) {
	if (getProp(scope, 'c2')) {
		return ifContent2;
	}
}

function ifContent2(scope, injector) {
	return renderAddClass(injector, 'foo bar');
}

function ifBlock3(scope) {
	if (getProp(scope, 'c3')) {
		return ifContent3;
	}
}

function ifContent3(scope, injector) {
	return renderAttributeDynValue(scope, injector, 'class', attrValue3);
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
