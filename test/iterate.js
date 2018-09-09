import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import iterate from './samples/iterate';

describe('Iterate', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('basic', () => {
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

		// Render same content but in different order: must keep the same `<li>`
		// nodes in original order and update its contents
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
});
