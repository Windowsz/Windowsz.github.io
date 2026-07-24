// "Reader mode" article extraction used by src/routes/api/read/+server.ts.
// Fetches a news article's raw HTML, runs Mozilla's Readability parser (the same
// one behind Firefox Reader View) to pull out the article body, then sanitizes
// the resulting HTML before it's ever rendered client-side with {@html}.
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';

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

export async function extractArticle(url: string): Promise<ReaderArticle> {
	const res = await fetch(url, {
		headers: { 'User-Agent': USER_AGENT },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
	});
	if (!res.ok) throw new Error(`Fetch failed with ${res.status}`);

	const html = await res.text();
	const dom = new JSDOM(html, { url });
	const article = new Readability(dom.window.document).parse();

	if (!article?.content) throw new Error('Readability could not extract article content');

	return {
		title: article.title ?? '',
		byline: article.byline ?? null,
		siteName: article.siteName ?? null,
		contentHtml: DOMPurify.sanitize(article.content, {
			ALLOWED_TAGS: [
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
			ALLOWED_ATTR: ['href', 'src', 'alt', 'title']
		})
	};
}
