// Applies to every route: the whole site is static content, so prerender it all.
// (The /api/news endpoint overrides this itself since it only exists on the Vercel build.)
export const prerender = true;
