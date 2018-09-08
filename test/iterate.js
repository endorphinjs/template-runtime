import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import iterate from './samples/iterate';
import keyIterate from './samples/key-iterate';

describe('Iterate', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it.only('basic', () => {
		let prev, cur;
		const target = document.createElement('div');
		const listNodes = () => Array.from(target.childNodes[2].childNodes);
		const state = {
			items: [
				{ id: 1, marked: true },
				{ id: 2, marked: false },
				{ id: 3, marked: false },
				{ id: 4, marked: true }
			]
		};
		const update = iterate(state, target);

		assert.equal(target.innerHTML, read('fixtures/iterate1.html'));

		// Render same content but in different order: must keep the same `<li>` nodes
		prev = listNodes();
		update({
			items: [
				{ id: 3, marked: false },
				{ id: 2, marked: false },
				{ id: 1, marked: true },
				{ id: 4, marked: true }
			]
		});

		assert.equal(target.innerHTML, read('fixtures/iterate2.html'));

		cur = listNodes();
		cur.forEach((node, i) => assert.strictEqual(node, prev[i]));

		// Render less elements
		update({
			items: [
				{ id: 1, marked: false },
				{ id: 2, marked: false }
			]
		});

		cur = listNodes();
		assert.equal(target.innerHTML, read('fixtures/iterate3.html'));
		assert.strictEqual(cur[0], prev[0]);
		assert.strictEqual(cur[1], prev[1]);

		// Render more elements
		update({
			items: [
				{ id: 3, marked: false },
				{ id: 2, marked: false },
				{ id: 1, marked: true },
				{ id: 4, marked: true }
			]
		});

		cur = listNodes();
		assert.equal(target.innerHTML, read('fixtures/iterate2.html'));
		assert.strictEqual(cur[0], prev[0]);
		assert.strictEqual(cur[1], prev[1]);
	});

	it.skip('keyed', () => {
		let prev, cur;
		const target = document.createElement('div');
		const listNodes = () => Array.from(target.childNodes[2].childNodes);
		const update = createRenderer(target, keyIterate, {
			items: [
				{ id: 1, marked: true },
				{ id: 2, marked: false },
				{ id: 3, marked: false },
				{ id: 4, marked: true }
			]
		});

		assert.equal(target.innerHTML, read('fixtures/iterate1.html'));

		// Render same content but in different order: must keep the same `<li>` nodes,
		// but they should be reordered
		prev = listNodes();

		update({
			items: [
				{ id: 3, marked: false },
				{ id: 2, marked: false },
				{ id: 1, marked: true },
				{ id: 4, marked: true }
			]
		});

		assert.equal(target.innerHTML, read('fixtures/iterate2.html'));

		cur = listNodes();

		assert.strictEqual(cur[0], prev[2]);
		assert.strictEqual(cur[1], prev[1]);
		assert.strictEqual(cur[2], prev[0]);
		assert.strictEqual(cur[4], prev[4]);

		// Both 1 and 2 shoud be reordered, but since actual position of 2 before
		// reorder is the same as target one, we shouldn’t re-attach this block
		assert(cur[0].attached > cur[2].attached);
		assert(cur[0].detached > cur[2].detached);

		// Render less elements
		update({
			items: [
				{ id: 1, marked: false },
				{ id: 2, marked: false }
			]
		});

		cur = listNodes();
		assert.equal(target.innerHTML, read('fixtures/iterate3.html'));
		assert.strictEqual(cur[0], prev[0]);
		assert.strictEqual(cur[1], prev[1]);

		// Render more elements
		update({
			items: [
				{ id: 3, marked: false },
				{ id: 2, marked: false },
				{ id: 1, marked: true },
				{ id: 4, marked: true }
			]
		});

		cur = listNodes();
		assert.equal(target.innerHTML, read('fixtures/iterate2.html'));
		assert.strictEqual(cur[0], prev[2]);
		assert.strictEqual(cur[1], prev[1]);
		assert.strictEqual(cur[2], prev[0]);
		assert.strictEqual(cur[4], prev[4]);
	});
});
