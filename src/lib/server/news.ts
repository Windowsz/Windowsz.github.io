// News aggregation logic used by src/routes/api/news/+server.ts.
// To add/remove an RSS source, edit RSS_FEEDS below. No API keys needed anywhere here.
import Parser from 'rss-parser';

export type NewsItem = {
	source: string;
	title: string;
	url: string;
	publishedAt: string; // ISO timestamp
	category: 'rss' | 'reddit' | 'hackernews';
};

const RSS_FEEDS = [
	{ name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
	{ name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
	{ name: 'NPR World', url: 'https://feeds.npr.org/1004/rss.xml' },
	{ name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss' }
];

const parser = new Parser();

async function fetchRss(): Promise<NewsItem[]> {
	const results = await Promise.allSettled(
		RSS_FEEDS.map(async (feed) => {
			const parsed = await parser.parseURL(feed.url);
			return (parsed.items ?? []).slice(0, 10).map(
				(item): NewsItem => ({
					source: feed.name,
					title: item.title ?? '(untitled)',
					url: item.link ?? feed.url,
					publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
					category: 'rss'
				})
			);
		})
	);

	return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

async function fetchReddit(): Promise<NewsItem[]> {
	try {
		const res = await fetch('https://www.reddit.com/r/worldnews/top.json?limit=15&t=day', {
			headers: { 'User-Agent': 'windowsz-portal-news/1.0' }
		});
		if (!res.ok) return [];

		const json = await res.json();
		return (json.data?.children ?? []).map(
			(child: { data: { title: string; url: string; permalink: string; created_utc: number } }): NewsItem => ({
				source: 'Reddit r/worldnews',
				title: child.data.title,
				url: child.data.url?.startsWith('http')
					? child.data.url
					: `https://reddit.com${child.data.permalink}`,
				publishedAt: new Date(child.data.created_utc * 1000).toISOString(),
				category: 'reddit'
			})
		);
	} catch {
		return [];
	}
}

async function fetchHackerNews(): Promise<NewsItem[]> {
	try {
		const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
		if (!idsRes.ok) return [];
		const ids: number[] = (await idsRes.json()).slice(0, 15);

		const items = await Promise.allSettled(
			ids.map(async (id) => {
				const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
				if (!res.ok) return null;
				const item = await res.json();
				if (!item?.title) return null;
				return {
					source: 'Hacker News',
					title: item.title,
					url: item.url ?? `https://news.ycombinator.com/item?id=${id}`,
					publishedAt: new Date(item.time * 1000).toISOString(),
					category: 'hackernews'
				} satisfies NewsItem;
			})
		);

		return items.flatMap((result) =>
			result.status === 'fulfilled' && result.value ? [result.value] : []
		);
	} catch {
		return [];
	}
}

export async function getAllNews(): Promise<NewsItem[]> {
	const [rss, reddit, hackerNews] = await Promise.all([
		fetchRss(),
		fetchReddit(),
		fetchHackerNews()
	]);

	return [...rss, ...reddit, ...hackerNews].sort(
		(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
	);
}
