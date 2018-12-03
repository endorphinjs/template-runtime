import {
	elem, text, elemWithText, insert, getProp, getVar, updateText,
	createComponent, mountComponent, updateAttribute, updateProps,
	enterScope, exitScope, obj, assign
} from '../../../runtime';

import * as InnerComponent from './inner-component';

/**
 * Local partials, used for runtime resolving
 */
const $partials = {
	'partial:item': partialMyItem
};

const partialMyItemVars = {
	enabled: true,
	pos: 0
};

export default function outerComponentTemplate(host) {
	const target = host.componentView;

	target.appendChild(elemWithText('h2', 'Default partials', host));
	const comp1 = target.appendChild( createComponent('inner-component', InnerComponent, host) );
	mountComponent(comp1, {
		items: getProp(host, 'items1')
	});

	target.appendChild(elemWithText('h2', 'Override partials', host));
	const comp2 = target.appendChild( createComponent('inner-component', InnerComponent, host) );
	mountComponent(comp2, {
		items: getProp(host, 'items2'),
		'partial:item': $partials['partial:item']
	});

	return function outerComponentTemplateUpdate() {
		updateProps(comp1, { items: getProp(host, 'items1') });
		updateProps(comp2, { items: getProp(host, 'items2') });
	};
}

export function partialMyItem(host, injector, vars) {
	enterScope(host, assign(obj(), partialMyItemVars, vars));

	const div = insert(injector, elem('div', host));
	const span = div.appendChild(elem('span', host));
	let attr1Value = updateAttribute(span, 'value', getVar(host, 'pos'));
	let text1Value = getVar(host, 'item');
	const textNode = span.appendChild(text(text1Value));

	exitScope(host);

	return function partialMyItemUpdate() {
		enterScope(host, assign(obj(), partialMyItemVars, vars));
		attr1Value = updateAttribute(span, 'value', getVar(host, 'pos'), attr1Value);
		text1Value = updateText(textNode, getVar(host, 'item'), text1Value);
		exitScope(host);
	};
}

export function props() {
	return {
		items1: ['one', 'two', 'three'],
		items2: ['foo', 'bar', 'baz']
	};
}
