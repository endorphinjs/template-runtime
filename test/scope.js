import assert from 'assert';
import document from './assets/document';
import { createComponent, getProp, getState, getVar, setVar, enterScope, exitScope } from '../runtime';

describe('Scope', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('should get props', () => {
		const component = createComponent('my-component', {
			props() {
				return {
					class: 'foo',
					id: 'bar',
					prop1: 123
				};
			}
		});

		assert.strictEqual(getProp(component, 'class'), 'foo');
		assert.strictEqual(getProp(component, 'id'), 'bar');
		assert.strictEqual(getProp(component, 'prop1'), 123);
		assert.strictEqual(getProp(component, 'prop2'), undefined);
	});

	it('should get/set state values', () => {
		const component = createComponent('my-component', {});

		assert.strictEqual(getState(component, 'foo'), undefined);

		component.setState({ foo: 'bar', baz: 1 });
		assert.strictEqual(getState(component, 'foo'), 'bar');
		assert.strictEqual(getState(component, 'baz'), 1);
	});

	it('should get/set local variables', () => {
		const component = createComponent('my-component', {});

		assert.strictEqual(getVar(component, 'foo'), undefined);

		setVar(component, 'foo', 'bar');
		setVar(component, 'baz', 1);
		assert.strictEqual(getVar(component, 'foo'), 'bar');
		assert.strictEqual(getVar(component, 'baz'), 1);

		// Enter new scope with variable collision
		enterScope(component, { baz: 2, a: 'b' });
		assert.strictEqual(getVar(component, 'foo'), 'bar');
		assert.strictEqual(getVar(component, 'baz'), 2);
		assert.strictEqual(getVar(component, 'a'), 'b');

		setVar(component, 'foo', 'bar2');
		assert.strictEqual(getVar(component, 'foo'), 'bar2');

		// Exit scope, should restore previous variables state
		exitScope(component);
		assert.strictEqual(getVar(component, 'foo'), 'bar');
		assert.strictEqual(getVar(component, 'baz'), 1);
		assert.strictEqual(getVar(component, 'a'), undefined);
	});
});
