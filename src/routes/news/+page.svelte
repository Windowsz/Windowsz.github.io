<!--
	News page. Data is NOT fetched at build time — it's fetched by the browser after the
	page loads (see onMount below), from whichever API the PUBLIC_API_BASE env var points to
	(see .env.example). This is what lets the static GitHub Pages build show live news
	without needing to be rebuilt every time.
-->
<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	type Topic = 'geopolitics' | 'economy' | 'tech' | 'climate' | 'thailand' | 'dev';

	type NewsItem = {
		source: string;
		title: string;
		url: string;
		publishedAt: string;
		category: 'rss' | 'reddit' | 'hackernews';
		topic: Topic;
	};

	const TOPICS: { value: Topic | 'all'; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'thailand', label: 'Thailand' },
		{ value: 'geopolitics', label: 'Geopolitics' },
		{ value: 'economy', label: 'Economy' },
		{ value: 'tech', label: 'Tech' },
		{ value: 'dev', label: 'IT/Dev' },
		{ value: 'climate', label: 'Climate' }
	];

	let items = $state<NewsItem[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let activeTopic = $state<Topic | 'all'>('all');
	let query = $state('');

	const apiUrl = env.PUBLIC_API_BASE || '/api/news';

	onMount(async () => {
		try {
			const res = await fetch(apiUrl, { signal: AbortSignal.timeout(25000) });
			if (!res.ok) throw new Error(`${res.status}`);
			items = await res.json();
			status = 'ready';
		} catch {
			status = 'error';
		}
	});

	let filtered = $derived(
		items.filter((item) => {
			const matchesTopic = activeTopic === 'all' || item.topic === activeTopic;
			const matchesQuery =
				query.trim() === '' || item.title.toLowerCase().includes(query.trim().toLowerCase());
			return matchesTopic && matchesQuery;
		})
	);

	function formatTime(iso: string) {
		return new Date(iso).toLocaleString();
	}
</script>

<div class="mx-auto max-w-2xl px-6 pt-28 pb-16">
	<h1 class="mb-6 text-3xl font-bold">News</h1>

	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-wrap gap-2">
			{#each TOPICS as topic (topic.value)}
				<button
					onclick={() => (activeTopic = topic.value)}
					class="rounded-full border px-3 py-1 text-xs transition {activeTopic === topic.value
						? 'border-white bg-white text-neutral-900'
						: 'border-white/20 text-white/70'}"
				>
					{topic.label}
				</button>
			{/each}
		</div>
		<input
			type="search"
			bind:value={query}
			placeholder="Search titles…"
			class="rounded-md border border-white/20 bg-transparent px-3 py-1.5 text-sm placeholder:text-white/40 focus:border-white/50 focus:outline-none"
		/>
	</div>

	{#if status === 'loading'}
		<p class="text-white/60">Loading news…</p>
	{:else if status === 'error'}
		<p class="text-red-400">Couldn't load news right now. Try again later.</p>
	{:else if filtered.length === 0}
		<p class="text-white/60">No news items match.</p>
	{:else}
		<ul class="space-y-3">
			{#each filtered as item (item.url)}
				<li class="rounded-lg border border-white/10 p-4">
					<a href={item.url} target="_blank" rel="noreferrer" class="font-medium hover:underline">
						{item.title}
					</a>
					<p class="mt-1 text-xs text-white/50">
						{item.source} · {formatTime(item.publishedAt)}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>
