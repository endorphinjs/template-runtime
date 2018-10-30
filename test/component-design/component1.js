/** @type {ComponentDefinition} */
export default {
	props() {
		return {
			items: [],
			type: 'foo'
		};
	},
	state() {
		return {
			a: 'b'
		};
	},

	calculateHeight() {

	},

	willRender() {
		this.calculateHeight();
	}

};
