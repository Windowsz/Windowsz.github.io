// "Reader mode" article extraction used by src/routes/api/read/+server.ts.
// Fetches a news article's raw HTML, runs Mozilla's Readability parser (the same
// one behind Firefox Reader View) to pull out the article body, then sanitizes
// the resulting HTML before it's ever rendered client-side with {@html}.
//
// Uses linkedom (not jsdom) and sanitize-html (not DOMPurify+jsdom) deliberately —
// jsdom is notoriously unreliable to bundle for serverless/edge functions (heavy,
// dynamic requires, native-ish optional deps) and caused 500s once actually
// deployed to Vercel despite working fine in local dev. Both replacements are
// pure JS with no such baggage.
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import sanitizeHtml from 'sanitize-html';

const FETCH_TIMEOUT_MS = 8000;

export type ReaderArticle = {
	title: string;
	byline: string | null;
	siteName: string | null;
	contentHtml: string;
};

// Many sites block non-browser requests outright; a normal browser UA is the
// only thing we can do about that without a full headless-browser fetch.
const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Readability resolves relative image/link URLs via document.baseURI, which
// linkedom only derives from a <base> element (it has no notion of "the URL
// this HTML was fetched from" otherwise) — so inject one ourselves.
function withBaseHref(html: string, url: string): string {
	const baseTag = `<base href="${url}">`;
	if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (tag) => `${tag}${baseTag}`);
	if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (tag) => `${tag}${baseTag}`);
	return baseTag + html;
}

export async function extractArticle(url: string): Promise<ReaderArticle> {
	const res = await fetch(url, {
		headers: { 'User-Agent': USER_AGENT },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
	});
	if (!res.ok) throw new Error(`Fetch failed with ${res.status}`);

	const html = await res.text();
	const { document } = parseHTML(withBaseHref(html, url));
	const article = new Readability(document as unknown as Document).parse();

	if (!article?.content) throw new Error('Readability could not extract article content');

	return {
		title: article.title ?? '',
		byline: article.byline ?? null,
		siteName: article.siteName ?? null,
		contentHtml: sanitizeHtml(article.content, {
			allowedTags: [
				'p',
				'br',
				'a',
				'strong',
				'em',
				'b',
				'i',
				'u',
				'blockquote',
				'ul',
				'ol',
				'li',
				'h1',
				'h2',
				'h3',
				'h4',
				'img',
				'figure',
				'figcaption',
				'pre',
				'code'
			],
			allowedAttributes: {
				a: ['href', 'title'],
				img: ['src', 'alt', 'title']
			}
		})
	};
}
