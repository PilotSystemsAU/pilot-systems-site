// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pilotsystems.com.au',
  trailingSlash: 'never',
  integrations: [
    sitemap({ filter: (page) => !['/thanks', '/privacy', '/terms'].some((p) => page.includes(p)) }),
  ],
  redirects: {
    '/home': '/',
    '/who-we-are': '/about',
  },
});
