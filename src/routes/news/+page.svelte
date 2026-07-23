<!--
	News page. Data is NOT fetched at build time — it's fetched by the browser after the
	page loads (see onMount below), from whichever API the PUBLIC_API_BASE env var points to
	(see .env.example). This is what lets the static GitHub Pages build show live news
	without needing to be rebuilt every time.
-->
<script lang="ts">
	import { PUBLIC_API_BASE } from '$env/static/public';
	import { onMount } from 'svelte';

	type NewsItem = {
		source: string;
		title: string;
		url: string;
		publishedAt: string;
		category: 'rss' | 'reddit' | 'hackernews';
	};

	let items = $state<NewsItem[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');

	const apiUrl = PUBLIC_API_BASE || '/api/news';

	onMount(async () => {
		try {
			const res = await fetch(apiUrl);
			if (!res.ok) throw new Error(`${res.status}`);
			items = await res.json();
			status = 'ready';
		} catch {
			status = 'error';
		}
	});

	function formatTime(iso: string) {
		return new Date(iso).toLocaleString();
	}
</script>

<div class="mx-auto max-w-2xl px-6 pt-28 pb-16">
	<h1 class="mb-6 text-3xl font-bold">News</h1>

	{#if status === 'loading'}
		<p class="text-white/60">Loading news…</p>
	{:else if status === 'error'}
		<p class="text-red-400">Couldn't load news right now. Try again later.</p>
	{:else if items.length === 0}
		<p class="text-white/60">No news items found.</p>
	{:else}
		<ul class="space-y-3">
			{#each items as item (item.url)}
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
