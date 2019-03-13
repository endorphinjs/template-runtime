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
 * Prepends given value to linked list
 * @template T
 * @param {LinkedList} list
 * @param {T} value
 * @return {LinkedListItem<T>}
 */
export function listPrependValue(list, value) {
	const item = createListItem(value);
	if (item.next = list.head) {
		item.next.prev = item;
	}

	return list.head = item;
}

/**
 * Inserts given value after given `ref` item
 * @template T
 * @param {T} value
 * @param {LinkedListItem<any>} ref
 * @return {LinkedListItem<T>}
 */
export function listInsertValueAfter(value, ref) {
	const item = createListItem(value);
	const { next } = ref;
	ref.next = item;
	item.prev = ref;

	if (item.next = next) {
		next.prev = item;
	}

	return item;
}

/**
 * Removes given item from list
 * @param {LinkedList} list
 * @param {LinkedListItem} item
 */
export function listRemove(list, item) {
	listDetachFragment(list, item, item);
}

/**
 * Moves list fragment with `start` and `end` bounds right after `ref` item
 * @param {LinkedList} list
 * @param {LinkedListItem} start
 * @param {LinkedListItem} end
 * @param {LinkedListItem} ref
 */
export function listMoveFragmentAfter(list, start, end, ref) {
	listDetachFragment(list, start, end);

	if (end.next = ref.next) {
		end.next.prev = end;
	}

	ref.next = start;
	start.prev = ref;
}

/**
 * Moves list fragment with `start` and `end` to list head
 * @param {LinkedList} list
 * @param {LinkedListItem} start
 * @param {LinkedListItem} end
 */
export function listMoveFragmentFirst(list, start, end) {
	listDetachFragment(list, start, end);

	if (end.next = list.head) {
		end.next.prev = end;
	}

	list.head = start;
}

/**
 * Detaches list fragment with `start` and `end` from list
 * @param {LinkedList} list
 * @param {LinkedListItem} start
 * @param {LinkedListItem} end
 */
export function listDetachFragment(list, start, end) {
	const { prev } = start;
	const { next } = end;

	if (prev) {
		prev.next = next;
	} else {
		list.head = next;
	}

	if (next) {
		next.prev = prev;
	}

	start.prev = end.next = null;
}
