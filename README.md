# Stash21 — IoT & Hardware Blog

A cinematic, animated Next.js 14 blog and community hub for IoT tinkerers and hardware hackers, with a 3D interactive hero, full blog CMS via Supabase, and an admin dashboard.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion for animation
- React Three Fiber + drei for the 3D exploded circuit board hero
- Supabase (Postgres + Auth) for posts, comments, reactions, and feedback
- react-markdown for post rendering

## Getting Started

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key.
3. Run the SQL in `supabase/schema.sql` against your Supabase project (SQL Editor).
4. Create at least one user in Supabase Auth — that's your admin login at `/admin`.
5. `npm run dev` and open http://localhost:3000

If Supabase isn't configured yet, the site gracefully falls back to bundled sample posts so the blog always looks populated.

## Structure

- `app/` — routes: home, `/blog`, `/blog/[slug]`, `/feedback`, `/admin`, `/admin/dashboard`
- `components/hero/` — the 3D scene, floating module cards, and hero copy
- `components/home/` — category strip, featured posts, "why us" section, CTA banner
- `components/` — shared primitives: Navbar, Footer, CustomCursor, ScrollProgress, TiltCard, ScrollReveal, MagneticButton, TechMarquee, PageTransition
- `lib/` — Supabase client, TypeScript types, bundled sample posts
- `supabase/schema.sql` — full database schema, RLS policies, and RPC helpers

## Design System

- Palette: brass, copper, champagne, maroon, and bronze on a near-black ink background — evokes a vintage workshop / soldering-iron aesthetic
- Fonts: Cinzel (display/serif) for headings, Inter for body copy, JetBrains Mono for code and labels
- Motion: scroll-driven 3D board explosion in the hero, magnetic buttons, tilt+spotlight cards, scroll-reveal sections, animated scroll progress bar, custom cursor

## What Changed in This Rebuild

### Bugs fixed
- **Overlapping floating boxes on the home page hero**: the four floating module cards (WiFi & LoRa, Edge Compute, Power Systems, Sensor Fusion) were colliding at certain scroll positions. They're now pinned to the four corners with generous spacing, hidden below the `lg` breakpoint (mobile never needs them), and fade cleanly in and out as you scroll through the hero.
- **Blog posts had no images**: generated three custom circuit-art cover images and wired them into every sample post, plus added a tasteful gradient + monogram placeholder for any future post published without a cover.

### New "wow factor" additions
- **Custom cursor** — a minimal ring that magnetically expands over every clickable element (desktop only).
- **Scroll progress bar** — a thin glowing brass line across the top of the viewport.
- **Magnetic buttons** — key CTAs pull slightly toward your cursor before you click.
- **Tilt + spotlight cards** — every card across the site tilts subtly in 3D and reveals a soft light spotlight following your cursor.
- **Scroll-reveal animations** — sections fade and rise into view via IntersectionObserver.
- **Infinite tech marquee** — a scrolling strip of hardware/protocol tags between the hero and category sections.
- **Aurora CTA banner** — an animated gradient call-to-action block before the footer.
- **Page transitions** — smooth fade/slide animation between routes.
- **Atmosphere upgrade** — added fog and stronger wire glow to the 3D hero scene for more cinematic depth.

## Suggestions for Going Further

- Swap the generated circuit-art covers for real photos of your own builds once available — instantly more authentic.
- Consider a subtle looping ambient sound toggle (a common touch on award-winning portfolio sites) — not added here since it needs your own sound assets.
- If you want the 3D board to be an exact replica of a specific board (e.g. real Arduino Uno), share reference photos and the geometry can be rebuilt to match precisely.
- Add an RSS feed and OpenGraph image generation per post for better social sharing.


## Performance & Navigation Speed Fixes

If page switches (e.g. clicking "Blog" in the navbar) felt slow with visible recompiling, that was Next.js dev-mode lazily compiling each route the first time you visit it — normal in development, not a production issue, but still fixed here:

- **Turbopack enabled** (`next dev --turbo`) — dramatically faster incremental compiles during development.
- **`optimizePackageImports`** enabled for `lucide-react`, `framer-motion`, `@react-three/drei`, and `date-fns` so only the icons/functions you actually use are bundled and compiled, not entire libraries.
- **Route-level `loading.tsx` skeletons** added for `/blog`, `/blog/[slug]`, `/feedback`, and `/admin/dashboard` — the moment you click a nav link, you now see an instant skeleton screen instead of a blank frozen page while data loads.
- **Non-blocking page transitions** — switched `AnimatePresence` from `mode="wait"` (which held the old page on screen until the new one fully finished animating in) to `mode="popLayout"` with a shorter, snappier transition.
- The heavy 3D hero (`ArduinoScene`) is confirmed to load only on the homepage — blog, feedback, and admin routes never import or compile it, so they stay lightweight.

Note: the very first visit to any route in `next dev` will still compile once (this is unavoidable in development mode) — but every visit after that, and the entire experience in a production build (`npm run build && npm start`), will be instant.


## Offline-safe build mode

This version uses a local Supabase shim so the site builds cleanly without pulling optional telemetry packages during development or deployment. You can later swap it back to real Supabase if needed.


## Modern stack note

The project now avoids `react-markdown` and uses a custom renderer instead, which removes the outdated unified dependency path that caused build failures.
