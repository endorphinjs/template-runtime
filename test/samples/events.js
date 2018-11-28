import {
	createInjector, elem, getProp, addEvent, getEventHandler, finalizeEvents
} from '../../runtime';

export default function template(host) {
	const target = host.componentView;
	const elem1 = target.appendChild(elem('main'));
	const injector = createInjector(elem1);

	const onClick1 = function(event) {
		getEventHandler(host, 'method1', this)(getProp(host, 'foo'), getProp(host, 'bar'), event, host);
	};

	const onClick2 = function(event) {
		getEventHandler(host, 'method2', this)(getProp(host, 'foo'), getProp(host, 'bar'), event, host);
	};

	addEvent(injector, 'click', onClick1);
	ifEvent(host, injector, onClick2);
	finalizeEvents(injector);

	return function updateTemplate(){
		addEvent(injector, 'click', onClick1);
		ifEvent(host, injector, onClick2);
		finalizeEvents(injector);
	};
}

function ifEvent(host, injector, handler) {
	if (getProp(host, 'c1')) {
		addEvent(injector, 'click', handler);
	}
}
