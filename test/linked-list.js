import assert from 'assert';
import { createList, createListItem, listPrepend } from '../lib/linked-list';

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

	it('should prepend item', () => {
		const list = createList();
		const item1 = createListItem(1);
		const item2 = createListItem(2);
		const item3 = createListItem(3);

		listPrepend(list, item1);
		assert(list.head === item1);

		listPrepend(list, item2);
		assert(list.head === item2);
		assert.deepStrictEqual(toArray(list), [2, 1]);

		listPrepend(list, item3);
		assert(list.head === item3);
		assert.deepStrictEqual(toArray(list), [3, 2, 1]);

		listPrepend(list, item1);
		assert(list.head === item1);
		assert(list.head.prev === null);

		assert.deepStrictEqual(toArray(list), [1, 3, 2]);
	});

	it.skip('should insert after', () => {

	});

	it.skip('should remove', () => {

	});
});
