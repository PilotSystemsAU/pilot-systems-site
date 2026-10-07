// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pilotsystems.com.au',
  trailingSlash: 'never',
  // Pages stay static; only /api/enquiry runs on the server (a Vercel function).
  adapter: vercel(),
  integrations: [
    sitemap({ filter: (page) => !['/thanks'].some((p) => page.includes(p)) }),
  ],
  redirects: {
    '/home': '/',
    '/who-we-are': '/about',
  },
});
