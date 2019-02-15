import {
	elem, text, elemWithText, insert, getProp, updateText,
	createComponent, mountComponent, updateAttribute, updateProps
} from '../../../runtime';

import * as InnerComponent from './inner-component';

/**
 * Local partials, used for runtime resolving
 */
export const $partials = {
	'my-item': {
		defaults: {
			enabled: true,
			pos: 0
		},
		body: partialMyItem
	}
};

export default function outerComponentTemplate(host, scope) {
	const target = host.componentView;

	target.appendChild(elemWithText('h2', 'Default partials'));
	scope.comp1 = target.appendChild( createComponent('inner-component', InnerComponent, host) );
	mountComponent(scope.comp1, {
		items: host.props.items1
	});

	target.appendChild(elemWithText('h2', 'Override partials'));
	scope.comp2 = target.appendChild( createComponent('inner-component', InnerComponent, host) );
	mountComponent(scope.comp2, {
		items: getProp(host, 'items2'),
		'partial:item': $partials['my-item']
	});

	return outerComponentTemplateUpdate;
}

function outerComponentTemplateUpdate(host, scope) {
	updateProps(scope.comp1, { items: host.props.items1 });
	updateProps(scope.comp2, { items: host.props.items2 });
}

function partialMyItem(host, injector, scope) {
	const div = insert(injector, elem('div'));
	scope.span = div.appendChild(elem('span'));
	scope.attr1Value = updateAttribute(scope.span, 'value', scope.pos);
	scope.textNode = scope.span.appendChild(text(scope.text1Value = scope.item));

	return partialMyItemUpdate;
}

function partialMyItemUpdate(host, injector, scope) {
	scope.attr1Value = updateAttribute(scope.span, 'value', scope.pos, scope.attr1Value);
	scope.text1Value = updateText(scope.textNode, scope.item, scope.text1Value);
}

export function props() {
	return {
		items1: ['one', 'two', 'three'],
		items2: ['foo', 'bar', 'baz']
	};
}
