// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pilotsystems.com.au',
  trailingSlash: 'never',
  // Pages stay static; only /api/enquiry runs on the server (a Vercel function).
  // maxDuration: stop any single request after 15 seconds, whatever it is doing.
  adapter: vercel({ maxDuration: 15 }),
  // Every image on the site is optimised when the site is built, so the on-demand
  // image resizer Astro adds at /_image isn't needed. Answer it with a 404 instead
  // (see src/image-endpoint.ts).
  image: { endpoint: { route: '/_image', entrypoint: './src/image-endpoint.ts' } },
  integrations: [
    sitemap({ filter: (page) => !['/thanks'].some((p) => page.includes(p)) }),
  ],
  redirects: {
    '/home': '/',
    '/who-we-are': '/about',
  },
});
