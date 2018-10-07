import assert from 'assert';
import document from './assets/document';
import { createScope, getProp, getState, setState, getVar, setVar, enterScope, exitScope } from '../runtime';

describe('Scope', () => {
	it('should get props', () => {
		const component = document.createElement();
		const scope = createScope(component);

		component.setProps({
			class: 'foo',
			id: 'bar',
			prop1: 123
		});

		assert.strictEqual(getProp(scope, 'class'), 'foo');
		assert.strictEqual(getProp(scope, 'id'), 'bar');
		assert.strictEqual(getProp(scope, 'prop1'), 123);
		assert.strictEqual(getProp(scope, 'prop2'), undefined);
	});

	it('should get/set state values', () => {
		const scope = createScope(document.createElement());

		assert.strictEqual(getState(scope, 'foo'), undefined);

		setState(scope, 'foo', 'bar');
		setState(scope, 'baz', 1);
		assert.strictEqual(getState(scope, 'foo'), 'bar');
		assert.strictEqual(getState(scope, 'baz'), 1);
	});

	it('should get/set local variables', () => {
		const scope = createScope(document.createElement());

		assert.strictEqual(getVar(scope, 'foo'), undefined);

		setVar(scope, 'foo', 'bar');
		setVar(scope, 'baz', 1);
		assert.strictEqual(getVar(scope, 'foo'), 'bar');
		assert.strictEqual(getVar(scope, 'baz'), 1);

		// Enter new scope with variable collision
		enterScope(scope, { baz: 2, a: 'b' });
		assert.strictEqual(getVar(scope, 'foo'), 'bar');
		assert.strictEqual(getVar(scope, 'baz'), 2);
		assert.strictEqual(getVar(scope, 'a'), 'b');

		setVar(scope, 'foo', 'bar2');
		assert.strictEqual(getVar(scope, 'foo'), 'bar2');

		// Exit scope, should restore previous variables state
		exitScope(scope);
		assert.strictEqual(getVar(scope, 'foo'), 'bar');
		assert.strictEqual(getVar(scope, 'baz'), 1);
		assert.strictEqual(getVar(scope, 'a'), undefined);
	});
});
