# windowsz.github.io — personal portal

One SvelteKit codebase, deployed two places:

- **GitHub Pages** (this domain) — fully static build of everything except `/api/news`.
- **Vercel** — same code, plus the live `/api/news` function. Set this up separately in
  the Vercel dashboard (import this repo, Root Directory `/`, no env vars needed).

The `/news` page fetches from whichever URL `PUBLIC_API_BASE` points to (see
`.env.example`) — on Vercel that's empty (same-origin `/api/news`), on GitHub Pages
it's set to the Vercel app's URL by the deploy workflow. This is why GitHub Pages
doesn't need to rebuild on a timer to keep news fresh: the HTML is static, but the
browser fetches live data from Vercel every time someone opens the page.

## Where to edit things

| Want to change...                  | Edit this file                                  |
| ----------------------------------- | ------------------------------------------------ |
| Nav links (add/remove/rename)       | `src/routes/+layout.svelte`                       |
| Home page hero (video, quote)       | `src/routes/+page.svelte`, `static/bg.mp4`        |
| Which RSS/Reddit sources show up    | `src/lib/server/news.ts` (`RSS_FEEDS`/`REDDIT_SOURCES`) |
| News page layout, cards, dialog, infinite scroll | `src/routes/news/+page.svelte`       |
| Colors / global theme               | `src/app.css`                                      |
| GitHub Pages deploy steps           | `.github/workflows/deploy-site.yml`                |

## Developing

```sh
npm install
npm run dev
```

## Building

```sh
npm run build              # Vercel target (adapter-vercel), used by Vercel's own build
BUILD_TARGET=static npm run build   # GitHub Pages target (adapter-static), output in build/
```

## One-time setup still needed

1. **GitHub Pages**: in this repo's Settings → Pages, change Source to "GitHub Actions".
2. **Vercel**: create a new Vercel project pointing at this repo (Root Directory `/`).
   Once deployed, copy its URL and set it as a repository variable named
   `PUBLIC_API_BASE` (Settings → Secrets and variables → Actions → Variables) as
   `https://<your-vercel-app>.vercel.app/api/news`. Re-run the GitHub Pages workflow
   afterwards so the static site picks it up.
