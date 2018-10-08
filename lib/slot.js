/**
 * Renders incoming contents of given slot
 * @param {Element} slot
 * @param {object} incoming
 * @returns {boolean} Returns `true` if slot content was filled with incoming data,
 * `false` otherwise
 */
export function renderSlot(slot, incoming) {
	const name = slot.getAttribute('name') || '';
	const slotted = slot.hasAttribute('slotted');
	/** @type {Element | DocumentFragment} */
	const container = incoming && incoming[name];

	if (container && container.childNodes.length) {
		// There’s incoming slot content
		if (!slotted) {
			slot.setAttribute('slotted', '');
			incoming[name] = moveContents(container, slot);
		}

		return true;
	}

	if (slotted) {
		// Parent renderer removed incoming data
		slot.removeAttribute('slotted');
		incoming[name] = null;
	}

	return false;
}

/**
 * Moves contents of given `from` element into `to` element
 * @param {Element | DocumentFragment} from
 * @param {Element} to
 * @returns {Element} The `to` element
 */
function moveContents(from, to) {
	if (from.nodeType === from.DOCUMENT_FRAGMENT_NODE) {
		to.appendChild(from);
	} else {
		let node;
		while (node = from.firstChild) {
			to.appendChild(node);
		}
	}

	return to;
}
