import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import iterate from './samples/iterate';
import { renderIterator, createInjector, createScope } from '../runtime';
import ElementShim from './assets/element-shim';

describe('Iterate', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('basic', () => {
		let prev, cur;
		const target = document.createElement('div');
		target.setProps({
			items: [
				{ id: 1, marked: true },
				{ id: 2, marked: false },
				{ id: 3, marked: false },
				{ id: 4, marked: true }
			]
		});
		const listNodes = () => Array.from(target.childNodes[2].childNodes);
		const update = iterate(target);

		assert.equal(target.innerHTML, read('fixtures/iterate1.html'));

		// Render same content but in different order: must keep the same `<li>`
		// nodes in original order and update its contents
		prev = listNodes();
		target.setProps({
			items: [
				{ id: 3, marked: false },
				{ id: 2, marked: false },
				{ id: 1, marked: true },
				{ id: 4, marked: true }
			]
		});
		update();

		assert.equal(target.innerHTML, read('fixtures/iterate2.html'));

		cur = listNodes();
		cur.forEach((node, i) => assert.strictEqual(node, prev[i]));

		// Render less elements
		target.setProps({
			items: [
				{ id: 1, marked: false },
				{ id: 2, marked: false }
			]
		});
		update();

		cur = listNodes();
		assert.equal(target.innerHTML, read('fixtures/iterate3.html'));
		assert.strictEqual(cur[0], prev[0]);
		assert.strictEqual(cur[1], prev[1]);

		// Render more elements
		target.setProps({
			items: [
				{ id: 3, marked: false },
				{ id: 2, marked: false },
				{ id: 1, marked: true },
				{ id: 4, marked: true }
			]
		});
		update();

		cur = listNodes();
		assert.equal(target.innerHTML, read('fixtures/iterate2.html'));
		assert.strictEqual(cur[0], prev[0]);
		assert.strictEqual(cur[1], prev[1]);
	});

	it.skip('should not render unchanged data', () => {
		// Original test assumed that colelction item rendering depends on
		// item value and it’s index in collection. But it actually may depend
		// on entire component scope, e.g. component properties, runtime variables
		// and so on. Disable this test for now, should provide better heuristics
		// for testing if items should be re-rendered
		let outerCalls = 0;
		const parent = new ElementShim();
		const innerCalls = [0, 0, 0];
		const wrap = arr => {
			arr.forEach = fn => {
				outerCalls++;
				Array.prototype.forEach.call(arr, fn);
			};
			return arr;
		};
		const expr = scope => scope.component;
		const body = scope => {
			innerCalls[scope.vars.value.id]++;
			return body;
		};
		const scope = createScope(wrap([ { id: 0 }, { id: 1 }, { id: 2 } ]));
		const update = renderIterator(scope, createInjector(parent), expr, body);

		assert.strictEqual(outerCalls, 1);
		assert.deepStrictEqual(innerCalls, [1, 1, 1]);

		// Render same object: no new renders
		update();
		assert.strictEqual(outerCalls, 1);
		assert.deepStrictEqual(innerCalls, [1, 1, 1]);

		// Introduce updated object
		const prev = scope.component;
		const state2 = scope.component = wrap([prev[0], { id: 1 }, prev[2]]);
		update();
		assert.strictEqual(outerCalls, 2);
		assert.deepStrictEqual(innerCalls, [1, 2, 1]);

		// Render less objects: no items re-render
		scope.component = wrap(scope.component.slice(0, 2));
		update();
		assert.strictEqual(outerCalls, 3);
		assert.deepStrictEqual(innerCalls, [1, 2, 1]);

		// Render with previous state: should render last item even if it’s
		// the same as previously rendered
		scope.component = state2;
		update();
		assert.strictEqual(outerCalls, 4);
		assert.deepStrictEqual(innerCalls, [1, 2, 2]);
	});
});
