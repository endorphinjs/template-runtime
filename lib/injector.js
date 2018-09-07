/**
 * Creates injector instance for given target, if required
 * @param {Element | Injector} target
 * @returns {Injector}
 */
export default function createInjector(target) {
	return target instanceof Injector ? target : new Injector(target);
}

export class Injector {
	/**
	 * @param {Element} parentNode
	 */
	constructor(parentNode) {
		this.parentNode = parentNode;
		this.items = [];
		this.ptr = 0;

		/** @type {Block[]} */
		this._stack = [];
	}

	/**
	 * Get DOM node nearest to given position of items list
	 * @param {Number} ix
	 * @returns {Node}
	 */
	getAnchorNode(ix) {
		while (ix < this.items.length) {
			const item = this.items[ix++];
			if (!isBlock(item)) {
				return item;
			}
		}
	}

	block() {
		const block = new Block();

		this.items.splice(this.ptr++, 0, block);
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
		} else if (block) {
			block.reset();
			ins = this.items.indexOf(block) + block.size + 1;
		}

		this._updateInsertPoint(ins);
		return block;
	}

	/**
	 * Inserts given node into current context
	 * @param {Node} node
	 * @returns {Node}
	 */
	insert(node) {
		const anchor = this.getAnchorNode(this.ptr);
		if (anchor) {
			this.parentNode.insertBefore(node, anchor);
		} else {
			this.parentNode.appendChild(node);
		}

		this.items.splice(this.ptr++, 0, node);
		this._inc();
		return node;
	}

	/**
	 * Moves contents of given block at `pos` location, effectively updating
	 * inserted nodes in parent context
	 * @param {Block} block
	 * @param {Number} pos
	 */
	move(block, pos) {
		if (this.items[pos] === block) {
			return;
		}

		// Move block contents at given position
		let anchor = this.getAnchorNode(pos);
		const { items, parentNode } = this;
		const curPos = this.items.indexOf(block);
		const blockItems = items.splice(curPos, block.size + 1);

		if (curPos < pos) {
			pos -= blockItems.length;
		}

		for (let i = blockItems.length - 1, item; i >= 0; i--) {
			item = blockItems[i];
			items.splice(pos, 0, item);
			if (!isBlock(item)) {
				if (anchor) {
					parentNode.insertBefore(item, anchor);
				} else {
					parentNode.appendChild(item);
				}

				anchor = item;
			}
		}
	}

	/**
	 * Disposes contents of context block
	 * @param {Boolean} self Remove block item as well
	 */
	dispose(self) {
		const block = last(this._stack);
		let ix = 0, size = this.items.length;

		if (block) {
			block.dispose(self);
			ix = this.items.indexOf(block) + (self ? 0 : 1);
			size = block.deleted;
		}

		if (size) {
			this.items.splice(ix, size).forEach(item => {
				if (!isBlock(item)) {
					this.parentNode.removeChild(item);
				}
			});
		}

		this._updateInsertPoint(ix);
	}

	_inc() {
		if (this._stack.length) {
			last(this._stack).insert();
		}
	}

	_updateInsertPoint(ix) {
		this.ptr = ix;
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

	/**
	 * Marks current block content as disposed
	 * @param {Boolean} self Marks block as removed as well
	 */
	dispose(self) {
		this.deleted += this.size + (self ? 1 : 0);
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
		block.reset();
	}

	reset() {
		this.inserted = this.deleted = 0;
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

/**
 * Check if given value is a block
 * @param {*} obj
 * @returns {Boolean}
 */
function isBlock(obj) {
	return obj instanceof Block;
}
