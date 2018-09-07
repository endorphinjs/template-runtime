export default class ElementShim {
	constructor() {
		this.childNodes = [];
	}

	appendChild(item) {
		this._remove(item);
		this.childNodes.push(item);
	}

	insertBefore(newNode, refNode) {
		if (this.childNodes.indexOf(refNode) === -1) {
			throw new Error('refNode is not a child node');
		}

		this._remove(newNode);
		const ix = this.childNodes.indexOf(refNode);
		this.childNodes.splice(ix, 0, newNode);
	}

	removeChild(node) {
		const ix = this.childNodes.indexOf(node);
		if (ix === -1) {
			throw new Error('Node is not a child');
		}

		this.childNodes.splice(ix, 1);
	}

	_remove(node) {
		const ix = this.childNodes.indexOf(node);
		if (ix !== -1) {
			this.childNodes.splice(ix, 1);
		}
	}
}
