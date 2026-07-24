<script lang="ts">
	// Nav links shown on every page. Add/remove/rename links here.
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/news', label: 'News' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="fixed top-0 z-20 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
		<nav class="mx-auto flex max-w-4xl justify-center gap-2 px-4 py-3">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="rounded-full px-4 py-1.5 text-sm font-medium transition {page.url.pathname ===
					link.href
						? 'bg-white text-neutral-900'
						: 'text-white/70 hover:bg-white/10 hover:text-white'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>
</div>
