const callbacks = [];

/**
 * Minimal DOM shim, required for testing
 */
class NodeShim {
	constructor(name, type, value) {
		this.nodeName = name;
		this.nodeType = type || 0;
		this.nodeValue = value;
		this.style = { animation: '' };

		/** @type {NodeShim[]} */
		this.childNodes = [];

		/** @type {Object[]} */
		this.attributes = [];

		/** @type {NodeShim} */
		this.parentNode = null;
		this.attached = 0;
		this.detached = 0;

		this.listeners = {};
	}

	get _index() {
		return this.parentNode ? this.parentNode._getIndex(this) : -1;
	}

	_getIndex(node) {
		return this.childNodes.indexOf(node);
	}

	/** @returns {NodeShim} */
	get nextSibling() {
		if (this.parentNode) {
			const siblings = this.parentNode.childNodes;
			const ix = this._index;
			if (ix !== -1 && ix < siblings.length - 1) {
				return siblings[ix + 1];
			}
		}

		return null;
	}

	/** @returns {NodeShim} */
	get previousSibling() {
		if (this.parentNode) {
			const siblings = this.parentNode.childNodes;
			const ix = this._index;
			if (ix > 0) {
				return siblings[ix - 1];
			}
		}
		return null;
	}

	get className() {
		return this.getAttribute('class');
	}

	set className(value) {
		this.setAttribute('class', value);
	}

	/** @returns {NodeShim} */
	get firstChild() {
		return this.childNodes[0];
	}

	getAttribute(name) {
		const attr = this.attributes.find(attr => attr.name === name);
		return attr ? attr.value : null;
	}

	setAttribute(name, value) {
		const attr = this.attributes.find(attr => attr.name === name);
		if (attr) {
			attr.value = value;
		} else {
			this.attributes.push({ name, value });
		}
	}

	removeAttribute(name) {
		this.attributes = this.attributes.filter(attr => attr.name !== name);
	}

	hasAttribute(name) {
		return !!this.attributes.find(attr => attr.name === name);
	}

	/**
	 * @param {NodeShim} node
	 * @returns {NodeShim}
	 */
	appendChild(node) {
		if (node.nodeType === NodeShim.DOCUMENT_FRAGMENT_NODE) {
			while (node.firstChild) {
				this.appendChild(node.firstChild);
			}
		} else {
			node.remove();
			this.childNodes.push(node);
			node.parentNode = this;
			node.attached++;
		}

		return node;
	}

	/**
	 * @param {NodeShim} node
	 * @param {NodeShim} ref
	 */
	insertBefore(node, ref) {
		if (node.nodeType === NodeShim.DOCUMENT_FRAGMENT_NODE) {
			while (node.firstChild) {
				this.insertBefore(node.firstChild, ref);
			}
		} else {
			if (!this.childNodes.includes(ref)) {
				throw new Error('Not a child node');
			}

			node.remove();

			const ix = this._getIndex(ref);
			this.childNodes.splice(ix, 0, node);
			node.parentNode = this;
			node.attached++;
		}

		return node;
	}

	removeChild(node) {
		if (this._getIndex(node) === -1) {
			throw new Error('Not a child node');
		}
		node.remove();
	}

	remove() {
		if (this.parentNode) {
			const siblings = this.parentNode.childNodes;
			const ix = this._index;
			if (ix === -1) {
				throw new Error('Not a child!');
			}

			siblings.splice(ix, 1);
			this.parentNode = null;
			this.detached++;
		}
	}

	/**
	 * @param {string} name
	 * @param {function} listener
	 */
	addEventListener(name, listener) {
		if (!this.listeners[name]) {
			this.listeners[name] = [listener];
		} else if (!this.listeners[name].includes(listener)) {
			this.listeners[name].push(listener);
		}
	}

	/**
	 * @param {string} name
	 * @param {function} listener
	 */
	removeEventListener(name, listener) {
		if (name in this.listeners) {
			this.listeners[name] = this.listeners[name].filter(item => item !== listener);
			if (!this.listeners[name].length) {
				delete this.listeners[name];
			}
		}
	}

	/**
	 * Dispatches given event
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		const listeners = this.listeners[event.type];
		if (listeners) {
			for (let i = listeners.length - 1; i >= 0; i--) {
				listeners[i].call(this, event);
			}
		}

		if (this.parentNode) {
			this.parentNode.dispatchEvent(event);
		}
	}

	toString() {
		return this.nodeName;
	}

	static get ELEMENT_NODE() { return 1; }
	static get TEXT_NODE() { return 3; }
	static get COMMENT_NODE() { return 8; }
	static get DOCUMENT_NODE() { return 9; }
	static get DOCUMENT_FRAGMENT_NODE() { return 11; }

	get ELEMENT_NODE() { return 1; }
	get TEXT_NODE() { return 3; }
	get COMMENT_NODE() { return 8; }
	get DOCUMENT_NODE() { return 9; }
	get DOCUMENT_FRAGMENT_NODE() { return 11; }
}

class DocumentShim extends NodeShim {
	constructor() {
		super('#document', NodeShim.DOCUMENT_NODE);
	}

	toString() {
		return stringifyChildren(this);
	}

	createDocumentFragment() {
		return new DocumentFragmentShim();
	}

	createElement(name) {
		const elem = new ElementShim(name);
		callbacks.forEach(fn => fn(elem));
		return elem;
	}

	createTextNode(value) {
		return new TextShim(value);
	}

	createComment(value) {
		return new CommentShim(value);
	}
}

class DocumentFragmentShim extends NodeShim {
	constructor() {
		super('#document-fragment', NodeShim.DOCUMENT_FRAGMENT_NODE);
	}

	toString(indent='\t', level=0) {
		const prefix = indent.repeat(level);
		return `${prefix}${this.nodeName}\n${stringifyChildren(this, indent, level + 1)}`;
	}
}

class ElementShim extends NodeShim {
	constructor(name) {
		super(name, NodeShim.ELEMENT_NODE);
	}

	get textContent() {
		return this.childNodes.map(node => node.textContent).join('');
	}

	set textContent(value) {
		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}

		this.appendChild(new TextShim(value));
	}

	get innerHTML() {
		return stringifyChildren(this);
	}

	set innerHTML(value) {
		this.childNodes.length = 0;
		parseHTML(this, value);
	}

	/**
	 * Finds node by given name
	 * @param {string} name
	 * @returns {ElementShim}
	 */
	findByName(name) {
		let ctx = this.firstChild, child;
		while (ctx) {
			if (ctx.nodeName === name) {
				return ctx;
			}

			if (ctx.nodeType === ctx.ELEMENT_NODE) {
				child = ctx.findByName(name);
				if (child) {
					return child;
				}
			}

			ctx = ctx.nextSibling;
		}
	}

	toString(indent='\t', level=0) {
		const attrs = this.attributes.map(attr => ` ${attr.name}="${attr.value}"`).join('');
		const prefix = indent.repeat(level);

		if (!this.childNodes.length || this.childNodes.length === 1 && this.firstChild.nodeType === NodeShim.TEXT_NODE) {
			return `${prefix}<${this.nodeName}${attrs}>${stringifyChildren(this)}</${this.nodeName}>`;
		}

		return `${prefix}<${this.nodeName}${attrs}>\n${stringifyChildren(this, indent, level + 1)}\n${prefix}</${this.nodeName}>`;
	}
}

class TextShim extends NodeShim {
	constructor(value) {
		super('#text', NodeShim.TEXT_NODE, value);
	}

	get textContent() {
		return this.nodeValue;
	}

	set textContent(value) {
		return this.nodeValue = value;
	}

	toString(indent='\t', level=0) {
		return `${indent.repeat(level)}${this.nodeValue}`;
	}
}

class CommentShim extends NodeShim {
	constructor(value) {
		super('#comment', NodeShim.COMMENT_NODE, value);
	}

	toString(indent='\t', level=0) {
		return `${indent.repeat(level)}<!--${this.nodeValue}-->`;
	}
}

/**
 * @param {NodeShim} node
 * @param {String} indent
 * @param {Number} level
 * @returns {String}
 */
function stringifyChildren(node, indent='\t', level=0) {
	return node.childNodes
		.map(n => `${n.toString(indent, level)}`)
		.join('\n');
}

export default new DocumentShim();

export function setCallback(fn) {
	callbacks.push(fn);
}

export function clearCallbacks() {
	callbacks.length = 0;
}

/**
 * Parses given HTML code into dom
 * @param {string} html
 * @returns {ElementShim[]}
 */
function parseHTML(ctx, html) {
	let pos = 0, m;
	const re = /<\/?(\w+)>/g;

	// For testing purposes, parse XML nodes without attributes
	while (m = re.exec(html)) {
		if (pos !== m.index) {
			ctx.appendChild(new TextShim(html.slice(pos, m.index)));
		}

		if (m[0][1] === '/') {
			ctx = ctx.parentNode;
		} else {
			ctx = ctx.appendChild(new ElementShim(m[1]));
		}

		pos = m.index + m[0].length;
	}

	if (pos < html.length) {
		ctx.appendChild(new TextShim(html.slice(pos)));
	}

	return ctx;
}
