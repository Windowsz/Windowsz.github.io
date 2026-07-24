<!--
	Home page. This is the video-hero landing that used to be the whole site (index.html).
	Edit the quote/author text below, or swap static/bg.mp4 for a different background video.
-->
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

	<div class="mx-4 rounded-xl bg-neutral-50/95 px-6 py-5 text-center text-neutral-900 shadow-lg">
		<p class="mb-2 text-xl italic sm:text-2xl">
			"The only way to do great work is to love what you do."
		</p>
		<p class="text-base sm:text-lg">- Steve Jobs</p>
	</div>
</div>
