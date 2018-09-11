import assert from 'assert';
import read from './assets/read-file';
import document from './assets/document';
import keyIterate from './samples/key-iterate';
import { renderKeyIterator, createInjector, createScope } from '../runtime';
import ElementShim from './assets/element-shim';

describe('Key iterate', () => {
	before(() => global.document = document);
	after(() => delete global.document);

	it('keyed', () => {
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
		const update = keyIterate(target);

		assert.equal(target.innerHTML, read('fixtures/key-iterate1.html'));

		// Render same content but in different order: must keep the same `<li>` nodes,
		// but they should be reordered
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

		assert.equal(target.innerHTML, read('fixtures/key-iterate2.html'));

		cur = listNodes();

		assert.strictEqual(cur[0], prev[2]);
		assert.strictEqual(cur[1], prev[1]);
		assert.strictEqual(cur[2], prev[0]);
		assert.strictEqual(cur[4], prev[4]);

		// Both 2 and 3 should be reordered (detached and attached)
		assert(cur[0].attached > cur[2].attached);
		assert(cur[0].detached > cur[2].detached);
		assert(cur[0].attached === cur[1].attached);
		assert(cur[0].detached === cur[1].detached);

		// Render less elements
		target.setProps({
			items: [
				{ id: 1, marked: false },
				{ id: 2, marked: false }
			]
		});
		update();

		cur = listNodes();
		assert.equal(target.innerHTML, read('fixtures/key-iterate3.html'));
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
		assert.equal(target.innerHTML, read('fixtures/key-iterate2.html'));
		assert(cur[1] === prev[1]);
		assert(cur[2] === prev[0]);
		assert(cur[0] !== prev[2]);
		assert(cur[3] !== prev[3]);
	});

	it('should not render unchanged data', () => {
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
		const keyExpr = ctx => ctx.id;
		const body = scope => {
			innerCalls[scope.vars.value.id]++;
			return body;
		};
		const scope = createScope(wrap([{ id: 0 }, { id: 1 }, { id: 2 }]));
		const update = renderKeyIterator(scope, createInjector(parent), expr, keyExpr, body);

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
