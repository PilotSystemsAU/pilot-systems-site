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
