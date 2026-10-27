# NewGiza website

React 19 + TypeScript + Vite + Tailwind CSS 4, with Lenis smooth scrolling.
Built from `design_handoff_newgiza_website` (Home, NGU, Health Park, Club).

## Run

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # type-check + production build into dist/
    npm run preview
    npm run images     # after adding or changing anything in public/assets: makes WebP copies in public/img
    npm run images:force   # re-encode every image (after changing quality settings in scripts/optimize-images.mjs)

## Structure

- `src/fx/engine.ts` – the scroll motion engine (port of the handoff's `scrollfx.js`): one rAF loop,
  Lenis smooth scroll, reveals (`data-reveal`), pinned progress (`data-progress` → `--p`),
  horizontal tracks, parallax, count-ups. Respects `prefers-reduced-motion`.
- `src/pages/Journey.tsx` – hero + masterplan journey: one pinned map that moves centre → right → left,
  zooms into each place and swaps the story on the other side. Steps live in `KEYS` / `STORY`.
- `src/pages/AppJourney.tsx` – resident app journey: pinned phone swaps sides, its screen slides to each feature.
- `src/components/MiniMap.tsx` – "you are here" mini-map. Any element with `data-place="<id>"` (ids in
  `src/data/places.ts`) lights up its spot when it covers the middle of the screen.
- `src/components/PageTransition.tsx` – dark panels close, show the destination name, then open on the new page.
- `src/pages/Home.tsx` – the other home page sections.
- `src/pages/Facility.tsx` + `src/data/facilities.ts` – shared template for NGU / Health Park / Club.
- `src/pages/PlanJourney.tsx` + `src/data/planJourneys.ts` – each facility page’s plan journey (Health Park clinics
  plan, ACE plan, NGU on the masterplan). Steps, zoom points and text live in `planJourneys.ts`.
- `src/components/` – nav (with mobile menu), footer, register-interest dialog, shared UI.

## Before launch

- `src/lib/lead.ts` → `submitLead()` is NOT connected. Wire it to the CRM endpoint.
- Masterplan hotspot positions and all neighbourhood spots (`src/data/places.ts`) are estimates; confirm with the client.
- Plan journey zoom points (`src/data/planJourneys.ts`) were read off the plan images by eye; confirm with the client.
- App Store / Google Play links are placeholders.
- Replace compressed images with the client’s high-resolution originals, then run `npm run images`.
- Static hosting needs an SPA fallback (all routes → index.html).
