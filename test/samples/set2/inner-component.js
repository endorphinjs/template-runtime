import {
	elem, text, elemWithText, insert, getProp, updateText,
	updateAttribute, createInjector, mountIterator, updateIterator,
	mountPartial, updatePartial
} from '../../../runtime';

export default function innerComponentTemplate(host, scope) {
	const target = host.componentView;
	target.appendChild(elemWithText('h3', 'Inner component', host));
	const ul = target.appendChild(elem('ul'));
	const injector2 = createInjector(ul);
	scope.iter1 = mountIterator(host, injector2, forEachExpr1, forEachBody1);

	return partialsTemplateUpdate;
}

function partialsTemplateUpdate(host, scope) {
	updateIterator(scope.iter1);
}

export const $partials = {
	item: {
		defaults: {
			pos: 0,
			item: null
		},
		body: partialItem
	}
};

function partialItem(host, injector, scope) {
	scope.li = insert(injector, elem('li', host));
	const injector2 = createInjector(scope.li);
	scope.attr1Value = updateAttribute(scope.li, 'pos', scope.pos);
	scope.text1 = insert(injector2, text(scope.text1Value = scope.item));

	return partialButtonUpdate;
}

function partialButtonUpdate(host, injector, scope) {
	scope.attr1Value = updateAttribute(scope.li, 'pos', scope.pos, scope.attr1Value);
	scope.text1Value = updateText(scope.text1, scope.item, scope.text1Value);
}

function forEachExpr1(host) {
	return getProp(host, 'items');
}

function forEachBody1(host, injector, scope) {
	scope.partial1 = mountPartial(host, injector, host.props['partial:item'] || $partials['item'], {
		item: scope.value,
		pos: scope.index
	});

	return forEachBody1Update;
}

function forEachBody1Update(host, injector, scope) {
	updatePartial(scope.partial1, host.props['partial:item'] || $partials['item'], {
		item: scope.value,
		pos: scope.index
	});
}
