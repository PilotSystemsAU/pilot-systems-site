# Pilot Systems website

Marketing site for Pilot Systems (pilotsystems.com.au), built with Astro and deployed on Vercel.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install packages (run after pulling changes to package.json) |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Preview the production build locally |

## Where things live

- `src/data/site.ts`: phone, email, ABN and menu links (change them here once)
- `src/styles/global.css`: brand colours, fonts, buttons and shared layout
- `src/components/`: header, footer, call-to-action band, page hero, FAQ, mobile call bar
- `src/pages/`: one file per page (`index` = Home)
- `src/assets/`: logo SVGs and headshot (optimised automatically at build)

## Deploying

Work on the `redesign` branch. Every push gets a Vercel preview link. Production deploys only from `main`.

## Contact form

`src/pages/api/enquiry.ts` runs as a Vercel function. It needs `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` set in Vercel (Production and Preview). Each enquiry carries a `submission_id`, which is sent to Resend as an idempotency key, so the same enquiry is never emailed twice.

## Third-party notices

Several outline icons (phone, social and similar) are based on [Feather Icons](https://github.com/feathericons/feather), © Cole Bemis, used under the MIT licence. The Montserrat font is self-hosted from `@fontsource-variable/montserrat` under the SIL Open Font License 1.1.
