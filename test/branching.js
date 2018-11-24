import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import branching from './samples/branching';
import deepBranching from './samples/branching-deep-nesting';
import { createComponent, mountComponent } from '../runtime';

describe('Branching', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('basic', () => {
		const component = createComponent('my-component', {
			default: branching,
			props() {
				return { expr1: 2, expr2: true, expr3: true };
			}
		});

		// Initial render
		mountComponent(component);
		assert.equal(component.innerHTML, read('fixtures/branching1.html'));

		const [h1, p, div] = component.childNodes;

		// Re-render with the same state: must be exactly the same result
		const prevChildren = Array.from(component.childNodes);
		component.component.update();
		assert.equal(component.innerHTML, read('fixtures/branching1.html'));
		prevChildren.forEach((child, i) => assert.strictEqual(child, component.childNodes[i]));

		// Render with updated state: keep common elements, detach removed
		component.setProps({ expr1: true, expr2: false, expr3: false });
		assert.strictEqual(h1, component.childNodes[0]);
		assert.strictEqual(p, component.childNodes[1]);
		assert.strictEqual(div.parentNode, null);
		assert.equal(component.innerHTML, read('fixtures/branching2.html'));
	});

	it('deep', () => {
		const component = createComponent('my-component', {
			default: deepBranching,
			props() {
				return { expr1: 2, expr2: true, expr3: true };
			}
		});

		mountComponent(component);
		assert.equal(component.innerHTML, 'test');

		component.setProps({ expr2: false });
		assert.equal(component.innerHTML, '');

		component.setProps({ expr1: false, expr2: true });
		assert.equal(component.innerHTML, '');

		component.setProps({ expr1: true });
		assert.equal(component.innerHTML, 'test');
	});
});
