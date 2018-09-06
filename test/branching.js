import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import branching from './samples/branching';
import deepBranching from './samples/branching-deep-nesting';

describe('Branching', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('basic', () => {
		const target = document.createElement('div');
		const state = { expr1: 2, expr2: true, expr3: true };
		const update = branching(state, target);
		const [h1, p, div] = target.childNodes;

		// Initial render
		assert.equal(target.innerHTML, read('fixtures/branching1.html'));

		// Re-render with the same state: must be exactly the same result
		const prevChildren = Array.from(target.childNodes);
		update(state);
		assert.equal(target.innerHTML, read('fixtures/branching1.html'));
		prevChildren.forEach((child, i) => assert.strictEqual(child, target.childNodes[i]));

		// Render with updated state: keep common elements, detach removed
		update({ expr1: true });
		assert.strictEqual(h1, target.childNodes[0]);
		assert.strictEqual(p, target.childNodes[1]);
		assert.strictEqual(div.parentNode, null);
		assert.equal(target.innerHTML, read('fixtures/branching2.html'));
	});

	it('deep', () => {
		const target = document.createElement('div');
		const state = { expr1: true, expr2: true, expr3: true };
		const update = deepBranching(state, target);

		assert.equal(target.innerHTML, 'test');

		update({ expr1: true, expr2: false, expr3: true });
		assert.equal(target.innerHTML, '');

		update({ expr1: false, expr2: true, expr3: true });
		assert.equal(target.innerHTML, '');

		update({ expr1: true, expr2: true, expr3: true });
		assert.equal(target.innerHTML, 'test');
	});
});
