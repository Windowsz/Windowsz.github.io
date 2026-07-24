// Reader-mode article extraction API. Same deploy pattern as /api/news — only
// exists on the Vercel build, called cross-origin from the static GitHub Pages
// site's quick-view dialog (see src/routes/news/+page.svelte).
import { extractArticle } from '$lib/server/reader';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;
// Bumped memory (Vercel default is 1024MB already on most plans, but this makes
// it explicit) since parsing a full news page's DOM can be memory-hungry — a
// 500 with no CORS header at all (rather than our own handled JSON response)
// is the signature of the whole function crashing/OOMing, not a normal error.
export const config = { maxDuration: 15, memory: 1024 };

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

export const GET: RequestHandler = async ({ url }) => {
	// Everything is wrapped, deliberately — any throw in here must still come
	// back as JSON+CORS, never as a bare crash the browser can't even read.
	try {
		const target = url.searchParams.get('url');
		if (!target) {
			return json({ error: 'Missing url parameter' }, { status: 400, headers: CORS_HEADERS });
		}

		try {
			const parsed = new URL(target);
			if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
				throw new Error('Unsupported protocol');
			}
		} catch {
			return json({ error: 'Invalid url' }, { status: 400, headers: CORS_HEADERS });
		}

		const article = await extractArticle(target);
		return json(article, {
			headers: {
				...CORS_HEADERS,
				// Article content never changes once fetched — cache aggressively.
				'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
			}
		});
	} catch {
		// Extraction fails for plenty of legitimate reasons (paywall, anti-bot
		// challenge, unusual markup) — the client falls back to the RSS summary.
		return json({ error: 'Could not extract article' }, { status: 502, headers: CORS_HEADERS });
	}
};
