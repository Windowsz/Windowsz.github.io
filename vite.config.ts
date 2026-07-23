import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Same codebase, two deploy targets:
//   BUILD_TARGET=static npm run build  -> GitHub Pages (fully static, no server)
//   npm run build                      -> Vercel (has server functions, e.g. /api/news)
const adapter =
	process.env.BUILD_TARGET === 'static'
		? adapterStatic({ fallback: undefined, strict: false })
		: adapterVercel();

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter
		})
	]
});
