// /llms.txt — a plain-text summary of the site for AI assistants and search
// tools (format: https://llmstxt.org). Built from the same data as the pages,
// so prices and contact details can't drift out of sync.
import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { websites, systemsPricing, care } from '../data/offers';

export const prerender = true;

export const GET: APIRoute = () => {
  const url = (path: string) => new URL(path, site.url).href;
  const body = `# ${site.name}

> ${site.tagline} ${site.name} builds websites for trade and service businesses and sets up simple automations, such as missed-call text-back and automatic enquiry replies. Based in ${site.location}, working with tradies Australia-wide.

Key facts:

- Business: ${site.name} is a registered business name of ${site.legalName}, sole trader, ABN ${site.abn}.
- Contact: phone ${site.phoneDisplay}, email ${site.email}. First step is a free 15–25 minute discovery call.
- Prices are in Australian dollars. Founding rates apply to the first 5 projects. ${site.name} is not registered for GST, so no GST is added.
${websites.map((w) => `- ${w.name}: ${w.price} (${w.priceLabel.toLowerCase()}). ${w.oneLine} ${w.ongoing.replace(/^\+ /, 'Plus ')}.`).join('\n')}
${systemsPricing.map((s) => `- ${s.name}: ${s.price.charAt(0).toLowerCase() + s.price.slice(1)}.`).join('\n')}
${care.map((c) => `- ${c.name}: ${c.price}${c.per}. Renews automatically each month until cancelled; cancel any time by email with 30 days' notice.`).join('\n')}
- ${site.name} does not guarantee search rankings, numbers of enquiries, jobs or revenue.

## Pages

- [Home](${url('/')}): what ${site.name} does and who it is for
- [What We Do](${url('/services')}): website packages, systems (automations) and care plans, with what each includes
- [Pricing](${url('/pricing')}): prices, timelines, payment stages and what affects the price
- [About](${url('/about')}): the founder and how ${site.name} works
- [Contact](${url('/contact')}): book a free discovery call or send an enquiry

## Optional

- [Privacy Policy](${url('/privacy')})
- [Terms of Use](${url('/terms')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
