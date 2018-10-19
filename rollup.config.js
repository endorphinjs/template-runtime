export default {
	input: './runtime.js',
	output: [{
		file: './dist/runtime.es.js',
		format: 'es',
		sourcemap: true
	}, {
		file: './dist/runtime.cjs.js',
		format: 'cjs',
		sourcemap: true
	}]
};
