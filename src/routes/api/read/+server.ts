// Reader-mode article extraction API. Same deploy pattern as /api/news — only
// exists on the Vercel build, called cross-origin from the static GitHub Pages
// site's quick-view dialog (see src/routes/news/+page.svelte).
import { extractArticle } from '$lib/server/reader';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;
export const config = { maxDuration: 15 };

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

export const GET: RequestHandler = async ({ url }) => {
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

	try {
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
