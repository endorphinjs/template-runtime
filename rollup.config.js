export default {
	input: './runtime.js',
	output: [{
		file: './dist/runtime.es.js',
		format: 'es'
	}, {
		file: './dist/runtime.cjs.js',
		format: 'cjs'
	}]
};
