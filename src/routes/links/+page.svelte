<!-- Links page (Linktree-style). Replace the sample array below with your real social/profile links. -->
<script lang="ts">
	const links = [
		{ label: 'GitHub', url: 'https://github.com/windowsz' },
		{ label: 'Email', url: 'mailto:you@example.com' }
	];
</script>

<div class="mx-auto max-w-md px-6 pt-28 pb-16">
	<h1 class="mb-6 text-3xl font-bold">Links</h1>
	<ul class="space-y-3">
		{#each links as link (link.url)}
			<li>
				<a
					href={link.url}
					class="block rounded-lg border border-white/10 px-4 py-3 text-center hover:bg-white/5"
				>
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</div>
