// Astro adds an on-demand image resizer at /_image whenever a site has any server
// code. This site doesn't use it (every image is optimised when the site is built),
// and leaving it on lets anyone make the server do heavy image work on request.
// So on the live site it answers 404. Local development still uses Astro's own
// endpoint, which `astro dev` needs to show images.
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  if (import.meta.env.DEV) {
    const dev = await import('astro/assets/endpoint/dev');
    return dev.GET(context);
  }
  return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, max-age=86400' } });
};
