import {
	createInjector, elem, elemWithText, getProp,
	addStaticEvent, getEventHandler,
	mountIterator, updateIterator, insert, getScope
} from '../../runtime';

export default function template(host) {
	const target = host.componentView;
	const elem1 = target.appendChild(elem('ul'));
	const injector = createInjector(elem1);
	let scope = getScope(host);

	scope.foo = 1;
	const iter1 = mountIterator(host, injector, forEachExpr1, forEachBody1);
	scope.foo = 2;

	return function updateTemplate() {
		scope.foo = 1;
		updateIterator(iter1);
		scope.foo = 2;
	};
}

function forEachExpr1(host) {
	return getProp(host, 'items');
}

function forEachBody1(host, injector) {
	let scope = getScope(host);
	function onClick1(event) {
		getEventHandler(host, 'handleClick', this)(scope.index, scope.foo, scope.bar, event, host);
	}

	const elem1 = insert(injector, elemWithText('li', 'item'));
	scope.bar = scope.foo;
	addStaticEvent(elem1, 'click', onClick1);

	return () => {
		// NB in iterators, we should update scope since it’s re-created on each iteration
		scope = getScope(host);
		scope.bar = scope.foo;
	};
}
