export default class Injector {
	/**
	 * @param {Element} parentNode
	 */
	constructor(parentNode) {
		this.parentNode = parentNode;
		this.items = [];
		this._anchorItem = 0;

		/** @type {Node} */
		this._anchorNode = null;

		/** @type {Block[]} */
		this._stack = [];
	}

	block() {
		const block = new Block();

		this.items.splice(this._anchorItem++, 0, block);
		this._inc();
		return block;
	}

	/**
	 * Enters block rendering context
	 * @param {Block} block
	 */
	enter(block) {
		this._stack.push(block);
		this._updateInsertPoint(this.items.indexOf(block) + 1);
	}

	/**
	 * Exit block rendering context
	 * @returns {Block}
	 */
	exit() {
		let ins = this.items.length;
		const block = this._stack.pop();
		if (this._stack.length) {
			const lastBlock = last(this._stack);
			lastBlock.consume(block);
			ins = this.items.indexOf(lastBlock) + lastBlock.size + 1;
		}

		this._updateInsertPoint(ins);
		return block;
	}

	/**
	 * @param {Node} node
	 */
	insert(node) {
		if (this._anchorNode) {
			this.parentNode.insertBefore(node, this._anchorNode);
		} else {
			this.parentNode.appendChild(node);
		}
		this.items.splice(this._anchorItem++, 0, node);
		this._inc();
	}

	/**
	 * Disposes contents of context block
	 */
	dispose() {
		const block = last(this._stack);
		let ix = 0, size = this.items.length;

		if (block.size) {
			ix = this.items.indexOf(block) + 1;
			size = block.size;
			block.dispose();
		}

		this.items.splice(ix, size).forEach(item => {
			if (!(item instanceof Block)) {
				this.parentNode.removeChild(item);
			}
		});

		// TODO should update insertion point?
	}

	_inc() {
		if (this._stack.length) {
			last(this._stack).insert();
		}
	}

	_updateInsertPoint(ix) {
		this._anchorItem = ix;
		this._anchorNode = null;

		while (ix < this.items.length) {
			const item = this.items[ix++];
			if (!(item instanceof Block)) {
				this._anchorNode = item;
				break;
			}
		}
	}
}

class Block {
	constructor() {
		this.inserted = 0;
		this.deleted = 0;
		this.size = 0;
	}

	insert() {
		this.inserted++;
		this.size++;
	}

	dispose() {
		this.deleted = this.size;
		this.size = 0;
	}

	/**
	 * Consumes data from given block
	 * @param {Block} block
	 */
	consume(block) {
		this.inserted += block.inserted;
		this.deleted += block.deleted;
		this.size += block.inserted - block.deleted;
		block.inserted = block.deleted = 0;
	}
}

/**
 * Returns last item of given array
 * @param {Array} arr
 * @return {*}
 */
function last(arr) {
	return arr[arr.length - 1];
}
