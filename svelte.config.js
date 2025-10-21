import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@/*': './path/to/lib/*'
		},
		csrf: {
			// This value can not be set using environment variables, so we use our own hook
			// to block not trusted origins. I did not want to do this, but variables here
			// are compiled into the project.
			trustedOrigins: ['*']
		},
		env: {
			dir: './',
			publicPrefix: 'PUBLIC_'
		}
	}
};

export default config;
