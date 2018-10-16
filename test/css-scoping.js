import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import branching from './samples/branching-scoped';

describe('CSS scoping', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('basic', () => {
		const component = document.createElement('div');
		component.scope = 'end1';
		component.setProps({ expr1: 2, expr2: true, expr3: true });

		const update = branching(component);
		const [h1, p, div] = component.childNodes;

		// Initial render
		assert.equal(component.innerHTML, read('fixtures/branching1-scoped.html'));

		// Re-render with the same state: must be exactly the same result
		const prevChildren = Array.from(component.childNodes);
		update();
		assert.equal(component.innerHTML, read('fixtures/branching1-scoped.html'));
		prevChildren.forEach((child, i) => assert.strictEqual(child, component.childNodes[i]));

		// Render with updated state: keep common elements, detach removed
		component.setProps({ expr1: true }, true);
		update();
		assert.strictEqual(h1, component.childNodes[0]);
		assert.strictEqual(p, component.childNodes[1]);
		assert.strictEqual(div.parentNode, null);
		assert.equal(component.innerHTML, read('fixtures/branching2-scoped.html'));
	});
});
