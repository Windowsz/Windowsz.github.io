<!--
	Home page. This is the video-hero landing that used to be the whole site (index.html).
	Edit the quote/author text below, or swap static/bg.mp4 for a different background video.
	The CursorGrid overlay (src/lib/CursorGrid.svelte) is a decorative cursor effect —
	tweak its props here, or remove the whole block to drop it.
-->
<script lang="ts">
	import CursorGrid from '$lib/CursorGrid.svelte';
</script>

<div class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<video
		autoplay
		loop
		muted
		playsinline
		class="fixed top-0 left-0 -z-10 h-full w-full object-cover"
	>
		<source src="/bg.mp4" type="video/mp4" />
	</video>

	<div class="fixed inset-0 z-0">
		<CursorGrid
			cellSize={70}
			color="#D946EF"
			radius={140}
			falloff="smooth"
			holdTime={400}
			fadeDuration={800}
			lineWidth={1.2}
			maxOpacity={1}
			fillOpacity={0}
			gridOpacity={0}
			cellRadius={0}
			clickPulse={true}
			pulseSpeed={600}
		/>
	</div>

	<div
		class="relative z-10 mx-4 rounded-xl bg-neutral-50/95 px-6 py-5 text-center text-neutral-900 shadow-lg"
	>
		<p class="mb-2 text-xl italic sm:text-2xl">
			"The only way to do great work is to love what you do."
		</p>
		<p class="text-base sm:text-lg">- Steve Jobs</p>
	</div>
</div>
