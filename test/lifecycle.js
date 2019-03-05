import assert from 'assert';
import document from './assets/document';
import {
	createComponent, mountComponent, mountBlock, updateBlock, updateComponent,
	insert, setAttribute, elem, text, updateText, mountSlot, elemWithText,
	unmountComponent, addDisposeCallback, disposeBlock
} from '../runtime';

describe('Component lifecycle', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	// const definitions = Array.from([1, 2, 3, 4], createDefinition);
	const dfn1 = createDefinition(mount1);
	const dfn2 = createDefinition(mount2);
	const dfn3 = createDefinition(mount3);
	const dfn4 = createDefinition(mount4);

	it('should render updated components only', () => {
		const component = createComponent('component1', dfn1);
		mountComponent(component, { p1: 'p1Value0' });

		assertCalls(dfn1, {
			init: 1,
			didChange: 1,
			willMount: 1,
			didMount: 1,
			willUpdate: 0,
			didUpdate: 0,
			willRender: 1,
			didRender: 1,
			willUnmount: 0,
			didUnmount: 0
		});

		assertCalls(dfn2, {
			init: 1,
			didChange: 1,
			willMount: 1,
			didMount: 1,
			willUpdate: 0,
			didUpdate: 0,
			willRender: 1,
			didRender: 1,
			willUnmount: 0,
			didUnmount: 0
		});

		component.setProps({ p2: 'p2Value0' });
		assert.deepEqual(dfn1.calls.willRender, [{
			p1: { current: 'p1Value0', prev: undefined }
		}, {
			p2: { current: 'p2Value0', prev: undefined}
		}]);
		assertCalls(dfn1, {
			init: 1,
			didChange: 2,
			willMount: 1,
			didMount: 1,
			willUpdate: 1,
			didUpdate: 1,
			willRender: 2,
			didRender: 2,
			willUnmount: 0,
			didUnmount: 0
		});

		// Even if actual content of `<component2>` was changed (updated slot content),
		// the component itself wasn’t rendered: everything was rendered by parent
		// component only
		assertCalls(dfn2, {
			init: 1,
			didChange: 1,
			willMount: 1,
			didMount: 1,
			willUpdate: 0,
			didUpdate: 0,
			willRender: 1,
			didRender: 1,
			willUnmount: 0,
			didUnmount: 0
		});

		component.setProps({ p2: null });
		assertCalls(dfn1, {
			init: 1,
			didChange: 3,
			willMount: 1,
			didMount: 1,
			willUpdate: 2,
			didUpdate: 2,
			willRender: 3,
			didRender: 3,
			willUnmount: 0,
			didUnmount: 0
		});

		assertCalls(dfn3, {
			willUnmount: 1,
			didUnmount: 1
		});

		assertCalls(dfn4, {
			willUnmount: 1,
			didUnmount: 1
		});
	});

	function mount1(host, scope) {
		const target0 = host.componentView;
		const testInner10 = scope.$_testInner10 = target0.appendChild(createComponent('component2', dfn2, host));
		const injector0 = scope.$_injector0 = testInner10.componentModel.input;
		setAttribute(injector0, 'p1', host.props.p1);
		scope.$_block0 = mountBlock(host, injector0, component1Entry0);
		mountComponent(testInner10);
		addDisposeCallback(host, dispose1);
		return update1;
	}

	function update1(host, scope) {
		const injector0 = scope.$_injector0;
		setAttribute(injector0, 'p1', host.props.p1);
		updateBlock(scope.$_block0);
		updateComponent(scope.$_testInner10);
	}

	function dispose1(scope) {
		scope.$_testInner10 = unmountComponent(scope.$_testInner10);
		scope.$_block0 = disposeBlock(scope.$_block0.block);
	}

	function component1Content0(host, injector, scope) {
		const testInner20 = scope.$_testInner20 = insert(injector, createComponent('component3', dfn3, host));
		const injector0 = scope.$_injector1 = testInner20.componentModel.input;
		setAttribute(injector0, 'p3', host.props.p3);
		mountComponent(testInner20);
		addDisposeCallback(injector, component1Content0Dispose);
		return component1Content0Update;
	}

	function component1Content0Update(host, injector, scope) {
		const injector0 = scope.$_injector1;
		setAttribute(injector0, 'p3', host.props.p3);
		updateComponent(scope.$_testInner20);
	}

	function component1Content0Dispose(scope) {
		scope.$_testInner20 = unmountComponent(scope.$_testInner20);
		scope.$_injector1 = null;
	}

	function component1Entry0(host) {
		if (host.props.p2) {
			return component1Content0;
		}
	}

	function mount2(host, scope) {
		const target0 = host.componentView;
		const p0 = target0.appendChild(elem('p', host));
		p0.appendChild(text('Inner 2: '));
		scope.$_text0 = p0.appendChild(text(scope.$_textValue0 = host.props.p1));
		const slot0 = target0.appendChild(elem('slot', host));
		mountSlot(host, '', slot0);
		return update2;
	}

	function update2(host, scope) {
		scope.$_textValue0 = updateText(scope.$_text0, host.props.p1, scope.$_textValue0);
	}

	function mount3(host, scope) {
		const target0 = host.componentView;
		const p0 = target0.appendChild(elem('p', host));
		p0.appendChild(text('Inner 3: '));
		scope.$_text0 = p0.appendChild(text(scope.$_textValue0 = host.props.p3));
		const testInner30 = scope.$_testInner30 = target0.appendChild(createComponent('component4', dfn4, host));
		mountComponent(testInner30);
		addDisposeCallback(host, dispose3);
		return update3;
	}

	function update3(host, scope) {
		scope.$_textValue0 = updateText(scope.$_text0, host.props.p3, scope.$_textValue0);
		updateComponent(scope.$_testInner30);
	}

	function dispose3(scope) {
		scope.$_testInner30 = unmountComponent(scope.$_testInner30);
		scope.$_text0 = null;
		scope.$_textValue0 = null;
	}

	function mount4(host) {
		const target0 = host.componentView;
		target0.appendChild(elemWithText('p', 'Inner 4', host));
	}
});

function createDefinition(template) {
	const definition = {
		calls: {},
		default: template
	};
	['init', 'willMount', 'didMount', 'didChange', 'willUpdate', 'didUpdate', 'willRender', 'didRender', 'willUnmount', 'didUnmount'].forEach(name => {
		definition.calls[name] = [];
		definition[name] = (host, changes) => {
			definition.calls[name].push(changes);
		};
	});

	return definition;
}

function assertCalls(dfn, map) {
	Object.keys(map).forEach(name => {
		assert.equal(dfn.calls[name].length, map[name], name);
	});
}
