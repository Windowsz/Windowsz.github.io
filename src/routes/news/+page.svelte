<!--
	News page. Data is NOT fetched at build time — it's fetched by the browser after the
	page loads (see onMount below), from whichever API the PUBLIC_API_BASE env var points to
	(see .env.example). This is what lets the static GitHub Pages build show live news
	without needing to be rebuilt every time.

	Everything below (cards, dialog, infinite scroll) works off the one full list fetched
	once on load — "load more" just reveals more of what's already in memory, no extra
	network requests happen while scrolling.
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
		imageUrl?: string;
		summary?: string;
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

	const PAGE_SIZE = 20;

	let items = $state<NewsItem[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let activeTopic = $state<Topic | 'all'>('all');
	let query = $state('');
	let visibleCount = $state(PAGE_SIZE);
	let activeItem = $state<NewsItem | null>(null);
	let dialogEl: HTMLDialogElement;
	// Some sources block hotlinking, so an imageUrl existing doesn't guarantee it loads —
	// fall back to the placeholder box instead of leaving a blank gap.
	let brokenImages = $state(new Set<string>());

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

	let visibleItems = $derived(filtered.slice(0, visibleCount));

	// Reset pagination whenever the visible set of items would change underneath it.
	$effect(() => {
		activeTopic;
		query;
		visibleCount = PAGE_SIZE;
	});

	function loadMoreSentinel(node: HTMLElement) {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				visibleCount = Math.min(visibleCount + PAGE_SIZE, filtered.length);
			}
		});
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	function openQuickView(item: NewsItem) {
		activeItem = item;
		dialogEl.showModal();
	}

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
			{#each visibleItems as item (item.url)}
				<li class="relative flex gap-3 rounded-lg border border-white/10 p-4 pr-12">
					{#if item.imageUrl && !brokenImages.has(item.url)}
						<img
							src={item.imageUrl}
							alt=""
							loading="lazy"
							class="h-16 w-16 shrink-0 rounded-md object-cover"
							onerror={() => (brokenImages = new Set([...brokenImages, item.url]))}
						/>
					{:else}
						<div
							class="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-white/5 text-white/20"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								class="h-6 w-6"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<circle cx="8.5" cy="8.5" r="1.5" />
								<path d="M21 15l-5-5L5 21" />
							</svg>
						</div>
					{/if}

					<div class="min-w-0">
						<a
							href={item.url}
							target="_blank"
							rel="noreferrer"
							class="font-medium hover:underline"
						>
							{item.title}
						</a>
						<p class="mt-1 text-xs text-white/50">
							{item.source} · {formatTime(item.publishedAt)}
						</p>
					</div>

					<button
						onclick={() => openQuickView(item)}
						aria-label="Quick view"
						title="Quick view"
						class="absolute top-2 right-2 rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="h-4 w-4"
						>
							<path
								d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
							/>
							<circle cx="12" cy="12" r="3" />
						</svg>
					</button>
				</li>
			{/each}
		</ul>

		{#if visibleCount < filtered.length}
			<div use:loadMoreSentinel class="h-1"></div>
			<p class="mt-4 text-center text-xs text-white/40">Loading more…</p>
		{/if}
	{/if}
</div>

<dialog
	bind:this={dialogEl}
	onclose={() => (activeItem = null)}
	class="w-full max-w-lg rounded-xl bg-neutral-900 p-0 text-white backdrop:bg-black/60"
>
	{#if activeItem}
		<div class="relative">
			<button
				onclick={() => dialogEl.close()}
				aria-label="Close"
				class="absolute top-3 right-3 rounded-full bg-black/40 p-1.5 text-white/80 hover:bg-black/60 hover:text-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="h-4 w-4"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>

			{#if activeItem.imageUrl && !brokenImages.has(activeItem.url)}
				<img
					src={activeItem.imageUrl}
					alt=""
					class="h-48 w-full rounded-t-xl object-cover"
					onerror={() => (brokenImages = new Set([...brokenImages, activeItem!.url]))}
				/>
			{/if}

			<div class="p-5">
				<p class="mb-1 text-xs text-white/50">
					{activeItem.source} · {formatTime(activeItem.publishedAt)}
				</p>
				<h2 class="mb-3 text-lg font-semibold">{activeItem.title}</h2>
				<p class="mb-4 text-sm text-white/70">
					{activeItem.summary ?? 'No preview available for this article.'}
				</p>
				<a
					href={activeItem.url}
					target="_blank"
					rel="noreferrer"
					class="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-neutral-900 hover:bg-white/90"
				>
					Read full article ↗
				</a>
			</div>
		</div>
	{/if}
</dialog>
