import {
	createInjector, renderBlock, elem, setAttribute, createScope, getProp,
	elemWithText, renderAddClass, renderAddAttribute
} from '../../runtime';
import { insert } from '../../lib/injector';

export default function(component, target) {
	const scope = createScope(component);

	if (target == null) {
		target = component;
	}

	const elem1 = elem('main');
	const elem2 = elem1.appendChild(elem('section'));
	const attr1 = setAttribute(scope, elem2, 'id', attrValue1);
	elem2.setAttribute('title', defaultAttr1(scope));
	const attr2 = setAttribute(scope, elem2, 'class', attrValue2);

	const injector = createInjector(elem2);
	const class1 = renderAddClass(scope, injector, classValue1);
	const block1 = renderBlock(scope, injector, chooseBlock1);


	return () => {
		attr1();
		attr2();
		class1();
		block1();
	};
}

function chooseBlock1(scope) {
	if (getProp(scope, 'enabled')) {
		return chooseContent1;
	} else {
		return chooseContent2;
	}
}

function chooseContent1(scope, injector) {
	renderAddAttribute(scope, injector, 'title', attrValue3, defaultAttr1);
	renderAddAttribute(scope, injector, 'title', attrValue4, defaultAttr1);
	renderAddClass(scope, injector, classValue2);
	insert(injector, elemWithText('p', 'Enabled :)'));
}

function chooseContent2(scope, injector) {
	const attr1 = renderAddAttribute(scope, injector, 'title', attrValue5, defaultAttr1);
	renderAddAttribute(scope, injector, 'disabled', attrValue6);
	renderAddClass(scope, injector, classValue3);
	insert(injector, elemWithText('div', 'Disabled :)'));
	renderAddAttribute(scope, injector, 'disabled', attrValue7);

	return () => {
		attr1();
	};
}

function attrValue1(scope) {
	return getProp(scope, 'id');
}

function attrValue2(scope) {
	return 'foo ' + getProp(scope, 'id');
}

function attrValue3() {
	return 'on';
}

function attrValue4() {
	return 'on2';
}

function attrValue5(scope) {
	return 'off ' + getProp(scope, 'id');
}

function attrValue6() {
	return '1';
}

function attrValue7() {
	return 'false';
}

function defaultAttr1() {
	return 'default';
}

function classValue1() {
	return 'cl2';
}

function classValue2() {
	return 'enabled';
}

function classValue3() {
	return 'disabled';
}
