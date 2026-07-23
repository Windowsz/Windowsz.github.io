// News aggregation logic used by src/routes/api/news/+server.ts.
// To add/remove a source, edit RSS_FEEDS or REDDIT_SOURCES below — each one is tagged
// with a `topic` used for the filter buttons on the News page. No API keys needed anywhere.
import Parser from 'rss-parser';

export type Topic = 'geopolitics' | 'economy' | 'tech' | 'climate';

export type NewsItem = {
	source: string;
	title: string;
	url: string;
	publishedAt: string; // ISO timestamp
	category: 'rss' | 'reddit' | 'hackernews';
	topic: Topic;
};

const RSS_FEEDS: { name: string; url: string; topic: Topic }[] = [
	// Geopolitics / world news
	{ name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', topic: 'geopolitics' },
	{ name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', topic: 'geopolitics' },
	{ name: 'NPR World', url: 'https://feeds.npr.org/1004/rss.xml', topic: 'geopolitics' },
	{
		name: 'The Guardian World',
		url: 'https://www.theguardian.com/world/rss',
		topic: 'geopolitics'
	},
	{ name: 'DW World', url: 'https://rss.dw.com/rdf/rss-en-world', topic: 'geopolitics' },

	// Economy / business
	{ name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', topic: 'economy' },
	{
		name: 'The Guardian Business',
		url: 'https://www.theguardian.com/uk/business/rss',
		topic: 'economy'
	},
	{ name: 'NPR Business', url: 'https://feeds.npr.org/1006/rss.xml', topic: 'economy' },

	// Tech
	{
		name: 'BBC Technology',
		url: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
		topic: 'tech'
	},
	{
		name: 'The Guardian Technology',
		url: 'https://www.theguardian.com/uk/technology/rss',
		topic: 'tech'
	},
	{ name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', topic: 'tech' },

	// Climate / environment
	{
		name: 'BBC Science & Environment',
		url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
		topic: 'climate'
	},
	{
		name: 'The Guardian Environment',
		url: 'https://www.theguardian.com/environment/rss',
		topic: 'climate'
	}
];

const REDDIT_SOURCES: { subreddit: string; topic: Topic }[] = [
	{ subreddit: 'worldnews', topic: 'geopolitics' },
	{ subreddit: 'economics', topic: 'economy' },
	{ subreddit: 'technology', topic: 'tech' },
	{ subreddit: 'environment', topic: 'climate' }
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
					category: 'rss',
					topic: feed.topic
				})
			);
		})
	);

	return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

async function fetchReddit(): Promise<NewsItem[]> {
	const results = await Promise.allSettled(
		REDDIT_SOURCES.map(async ({ subreddit, topic }) => {
			const res = await fetch(
				`https://www.reddit.com/r/${subreddit}/top.json?limit=10&t=day`,
				{ headers: { 'User-Agent': 'windowsz-portal-news/1.0' } }
			);
			if (!res.ok) return [];

			const json = await res.json();
			return (json.data?.children ?? []).map(
				(child: {
					data: { title: string; url: string; permalink: string; created_utc: number };
				}): NewsItem => ({
					source: `Reddit r/${subreddit}`,
					title: child.data.title,
					url: child.data.url?.startsWith('http')
						? child.data.url
						: `https://reddit.com${child.data.permalink}`,
					publishedAt: new Date(child.data.created_utc * 1000).toISOString(),
					category: 'reddit',
					topic
				})
			);
		})
	);

	return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
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
					category: 'hackernews',
					topic: 'tech'
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
