<script lang="ts">
	// Nav links shown on every page. Add/remove/rename links here.
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/links', label: 'Links' },
		{ href: '/news', label: 'News' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="fixed top-0 z-10 w-full bg-black/40 backdrop-blur-sm">
		<nav class="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="text-white/80 transition hover:text-white"
					class:text-white={page.url.pathname === link.href}
					class:font-semibold={page.url.pathname === link.href}
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
