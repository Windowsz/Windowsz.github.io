// Live news API. Only exists on the Vercel build — the GitHub Pages static build
// skips this route (see BUILD_TARGET check in vite.config.ts) and instead fetches
// this same endpoint on the Vercel domain from the browser (see PUBLIC_API_BASE in .env).
import { getAllNews } from '$lib/server/news';
import { json } from '@sveltejs/kit';

// Must stay dynamic (not prerendered) — it fetches live data on every request.
export const prerender = false;

// Safety margin above the ~10s worst case of news.ts's per-request timeouts,
// in case Vercel's function needs longer than the platform default one day.
export const config = { maxDuration: 20 };

export async function GET() {
	const items = await getAllNews();

	return json(items, {
		headers: {
			// Allow the static GitHub Pages site to call this cross-origin, and let
			// Vercel's edge cache serve stale results for ~15min while refreshing.
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300'
		}
	});
}
