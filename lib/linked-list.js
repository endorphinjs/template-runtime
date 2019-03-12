/**
 * Creates linted list
 * @return {LinkedList}
 */
export function createList() {
	return { head: null };
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
 * Removes given item from list
 * @param {LinkedList} list
 * @param {LinkedListItem} item
 */
export function listRemove(list, item) {
	const { prev, next } = item;

	if (prev) {
		prev.next = next;
	}

	if (next) {
		next.prev = prev;
	}

	if (list.head === item) {
		list.head = next;
	}

	item.prev = item.next = null;
}

/**
 * Prepends given item to linked list
 * @param {LinkedList} list
 * @param {LinkedListItem} item
 * @returns {LinkedListItem}
 */
export function listPrepend(list, item) {
	if (list.head !== item) {
		if (item.prev) {
			item.prev.next = item.next;
		}

		if (item.next = list.head) {
			item.next.prev = item;
		}

		item.prev = null;
		list.head = item;
	}

	return item;
}

/**
 * Inserts given list item after `ref`
 * @param {LinkedListItem} ref
 * @param {LinkedListItem} item
 * @returns {LinkedListItem}
 */
export function listInsertAfter(ref, item) {
	if (item.next = ref.next) {
		item.next.prev = item;
	}

	item.prev = ref;
	ref.next = item;

	return item;
}
