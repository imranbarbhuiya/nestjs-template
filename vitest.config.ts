import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			reporter: ['text', 'lcov', 'clover'],
			provider: 'v8',
		},
	},
	resolve: {
		alias: {
			// 		'#app/mongoose': './src/lib/mongo/',
			// 		'#app/mongoose/*': './src/lib/mongo/*',
			'#zod': './src/lib/zod/',
		},
	},
	plugins: [
		swc.vite({
			module: { type: 'es6' },
		}),
	],
});
