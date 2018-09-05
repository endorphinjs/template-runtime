export default class ElementShim {
	constructor() {
		this.childNodes = [];
	}

	appendChild(item) {
		this.childNodes.push(item);
	}

	insertBefore(newNode, refNode) {
		const ix = this.childNodes.indexOf(refNode);
		if (ix === -1) {
			throw new Error('refNode is not a child node');
		}

		this.childNodes.splice(ix, 0, newNode);
	}

	removeChild(node) {
		const ix = this.childNodes.indexOf(node);
		if (ix === -1) {
			throw new Error('Node is not a child');
		}

		this.childNodes.splice(ix, 1);
	}
}
