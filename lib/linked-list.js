/**
 * Creates linted list
 * @param {LinkedListItem} [head]
 * @return {LinkedList}
 */
export function createList(head) {
	return { head };
}

/**
 * Creates linked list item
 * @template T
 * @param {T} value
 * @returns {LinkedListItem<T>}
 */
export function createListItem(value) {
	return { value, next: null, prev: null };
}

/**
 * Releases linked list item: cleans-up internal data
 * @param {LinkedListItem} item
 */
export function releaseListItem(item) {
	// TODO use object pool?
	item.value = item.next = item.prev = null;
}

/**
 * Inserts given `item` after `after` element in linked list or as first item,
 * if `after` is omitted
 * @param {LinkedList} list
 * @param {LinkedListItem} item
 * @param {LinkedListItem} [after]
 */
export function listInsert(list, item, after) {
	if (after) {
		item.prev = after;
		item.next = after.next;
		after.next = item;
	} else {
		item.prev = null;
		item.next = list.head;
		list.head = item;
	}
}
