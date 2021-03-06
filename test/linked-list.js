import assert from 'assert';
import { createList, listPrependValue, listInsertValueAfter, listRemove, listMoveFragmentAfter, listMoveFragmentFirst } from '../lib/linked-list';

describe('Linked list', () => {
	/** @param {LinkedList} */
	function toArray(list) {
		const result = [];
		let guard = 15;
		let item = list.head;
		while (item && guard--) {
			result.push(item.value);
			item = item.next;
		}

		return result;
	}

	function verify(list) {
		let prev = null;
		let item = list.head;
		let pos = 0;
		while (item) {
			if (item.prev !== prev) {
				throw new Error(`Invalid prev reference at ${pos}, got ${item.prev && item.prev.value}, expecting ${prev && prev.value}`);
			}

			pos++;
			prev = item;
			item = item.next;
		}
	}

	it('should prepend value', () => {
		const list = createList();

		const item1 = listPrependValue(list, 1);
		assert(list.head === item1);
		verify(list);

		const item2 = listPrependValue(list, 2);
		assert(list.head === item2);
		verify(list);
		assert.deepStrictEqual(toArray(list), [2, 1]);

		const item3 = listPrependValue(list, 3);
		assert(list.head === item3);
		verify(list);
		assert.deepStrictEqual(toArray(list), [3, 2, 1]);
	});

	it('should insert value after', () => {
		const list = createList();
		const item2 = listPrependValue(list, 2);
		const item1 = listPrependValue(list, 1);

		verify(list);
		assert.deepStrictEqual(toArray(list), [1, 2]);

		listInsertValueAfter(3, item1);
		verify(list);
		assert.deepStrictEqual(toArray(list), [1, 3, 2]);

		listInsertValueAfter(4, item2);
		verify(list);
		assert.deepStrictEqual(toArray(list), [1, 3, 2, 4]);
	});

	it('should remove', () => {
		const list = createList();
		const item3 = listPrependValue(list, 3);
		const item2 = listPrependValue(list, 2);
		const item1 = listPrependValue(list, 1);

		assert.deepStrictEqual(toArray(list), [1, 2, 3]);
		verify(list);

		listRemove(list, item2);
		assert.deepStrictEqual(toArray(list), [1, 3]);
		assert(item2.prev === null);
		assert(item2.next === null);

		listRemove(list, item3);
		assert.deepStrictEqual(toArray(list), [1]);
		assert(item3.prev === null);
		assert(item3.next === null);

		listRemove(list, item1);
		assert.deepStrictEqual(toArray(list), []);
		assert(item1.prev === null);
		assert(item1.next === null);
		assert(list.head === null);
	});

	it('should move', () => {
		const list = createList();
		const item5 = listPrependValue(list, 5);
		const item4 = listPrependValue(list, 4);
		const item3 = listPrependValue(list, 3);
		const item2 = listPrependValue(list, 2);
		const item1 = listPrependValue(list, 1);

		assert.deepStrictEqual(toArray(list), [1, 2, 3, 4, 5]);

		listMoveFragmentAfter(list, item1, item2, item5);
		verify(list);
		assert.deepStrictEqual(toArray(list), [3, 4, 5, 1, 2]);

		listMoveFragmentAfter(list, item5, item1, item3);
		verify(list);
		assert.deepStrictEqual(toArray(list), [3, 5, 1, 4, 2]);

		listMoveFragmentFirst(list, item4, item2);
		verify(list);
		assert.deepStrictEqual(toArray(list), [4, 2, 3, 5, 1]);
	});
});
