import {
	createInjector, elem, getProp, addEvent, getEventHandler, finalizeEvents
} from '../../src/runtime';

export default function template(host, scope) {
	const target = host.componentView;
	const elem1 = target.appendChild(elem('main'));
	scope.injector = createInjector(elem1);

	scope.onClick1 = function(event) {
		getEventHandler(host, 'method1', this)(getProp(host, 'foo'), getProp(host, 'bar'), event, host);
	};

	scope.onClick2 = function(event) {
		getEventHandler(host, 'method2', this)(getProp(host, 'foo'), getProp(host, 'bar'), event, host);
	};

	addEvent(scope.injector, 'click', scope.onClick1);
	ifEvent(host, scope.injector, scope.onClick2);
	finalizeEvents(scope.injector);

	return updateTemplate;
}

function updateTemplate(host, scope) {
	addEvent(scope.injector, 'click', scope.onClick1);
	ifEvent(host, scope.injector, scope.onClick2);
	finalizeEvents(scope.injector);
}

function ifEvent(host, injector, handler) {
	if (getProp(host, 'c1')) {
		addEvent(injector, 'click', handler);
	}
}
