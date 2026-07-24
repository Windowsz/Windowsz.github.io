<script lang="ts">
	// Nav links shown on every page. Add/remove/rename links here.
	import { glowHover } from '$lib/actions/glowHover';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/news', label: 'News' }
	];

	let showGoToTop = $state(false);

	onMount(() => {
		const onScroll = () => {
			showGoToTop = window.scrollY > 400;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header
		use:glowHover
		class="fixed top-0 z-20 w-full overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-xl"
	>
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

	{#if showGoToTop}
		<button
			onclick={scrollToTop}
			aria-label="Go to top"
			class="fixed right-6 bottom-6 z-30 rounded-full border border-white/10 bg-white/10 p-3 text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class="h-5 w-5"
			>
				<path d="M12 19V5M5 12l7-7 7 7" />
			</svg>
		</button>
	{/if}
</div>
