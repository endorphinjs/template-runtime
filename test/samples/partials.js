import {
	createInjector, elem, text, insert, getProp, mountIterator, updateIterator,
	enterScope, exitScope, getVar, assign, obj, updateText, addClass,
	finalizeAttributes
} from '../../runtime';

export default function partialsTemplate(host) {
	const target = host.componentView;

	const ul = target.appendChild(elem('ul'));
	const injector2 = createInjector(ul);
	const iter1 = mountIterator(host, injector2, forEachExpr1, forEachBody1);

	return function partialsTemplateUpdate() {
		updateIterator(iter1);
	};
}

const partialButtonVars = {
	enabled: true,
	pos: 0,
	item: null
};

export function partialButton(host, injector, vars) {
	enterScope(host, assign(obj(), partialButtonVars, vars));

	const li = insert(injector, elem('li', host));
	const injector2 = createInjector(li);
	ifAttr1(host, injector2);

	let text1Value = getVar(host, 'item');
	const text1 = insert(injector2, text(text1Value));

	finalizeAttributes(injector2);

	exitScope(host);

	return function partialButtonUpdate(vars) {
		enterScope(host, assign(obj(), partialButtonVars, vars));
		ifAttr1(host, injector2);
		text1Value = updateText(text1, getVar(host, 'item'), text1Value);
		finalizeAttributes(injector2);
		exitScope(host);
	};
}

function ifAttr1(host, injector) {
	if (getVar(host, 'enabled')) {
		addClass(injector, 'enabled');
	}
}

function forEachExpr1(host) {
	return getProp(host, 'items');
}

function forEachBody1(host, injector) {
	const partial1 = getProp(host, 'partial:button') || partialButton;
	const updatePartial = partial1(host, injector, {
		item: getVar(host, 'value'),
		enabled: getVar(host, 'index') !== 1
	});

	return () => {
		updatePartial({
			item: getVar(host, 'value'),
			enabled: getVar(host, 'index') !== 1
		});
	};
}
