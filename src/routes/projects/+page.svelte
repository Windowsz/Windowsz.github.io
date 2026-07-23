<!-- Projects page. Replace the sample array below with your real projects (or map it over data from src/lib). -->
<script lang="ts">
	const projects = [
		{ name: 'Example Project', description: 'One-line description of what it does.', url: '#' }
	];
</script>

<div class="mx-auto max-w-2xl px-6 pt-28 pb-16">
	<h1 class="mb-6 text-3xl font-bold">Projects</h1>
	<ul class="space-y-4">
		{#each projects as project (project.name)}
			<li class="rounded-lg border border-white/10 p-4">
				<a href={project.url} class="font-semibold text-white hover:underline">{project.name}</a>
				<p class="mt-1 text-sm text-white/70">{project.description}</p>
			</li>
		{/each}
	</ul>
</div>
