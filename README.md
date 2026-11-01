# StudioSpace — Client (Next.js)

Peer-to-peer creative workspace marketplace frontend. Creators discover daylight studios, sound
stages, podcast rooms and production spaces; hosts publish listings and confirm reservations.

- **Live site:** _not deployed yet — set this after the Vercel deploy (see “Deployment”)_
- **API repo:** `../studiospace-server` (Express + TypeScript + MongoDB)
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Better Auth ·
  Swiper · React Hook Form + Zod · Sonner · next-themes · jsPDF · Lucide

---

## Features

| Area | What is implemented |
| --- | --- |
| Home | Swiper hero (3 slides, fade, autoplay), featured studios from the API (max 6), 5 category tiles, 4-step booking explainer, host guarantee pillars |
| Explore | Server-side search, category/city/price/rating/capacity/amenity filters, 4 sort modes, pagination, URL query sync, mobile filter drawer, no-results state |
| Studio detail | Gallery with thumbnails, specs, host card, amenity/equipment chips, reviews with star rating, booking modal |
| Booking | Date + start/end time, live total preview, server-authoritative pricing, Sonner toasts, status pills, cancellation with confirm dialog, PDF invoice for confirmed bookings |
| Hosting | **Host Panel** (`/host`, reachable from the navbar host icon) with pending-request tabs, listing manager and booked value; add studio (imgbb upload + gallery + tag editors), edit studio, my listings, delete with confirmation |
| Account | Email/password auth (Better Auth), Google OAuth, profile editing, wishlist, theme toggle (light default), protected routes via `src/proxy.ts` |
| States | Skeleton loaders, branded empty states, error panels with retry, custom 404, route error boundary, image fallbacks — no `window.alert` anywhere |

---

## Screenshots

> Placeholder section — capture these after the first deploy (or from your local dev server):
>
> | View | Suggested file |
> | --- | --- |
> | Homepage hero | `docs/screenshots/home.png` |
> | Explore studios + filters | `docs/screenshots/explore.png` |
> | Studio detail | `docs/screenshots/studio-detail.png` |
> | Booking modal | `docs/screenshots/booking.png` |
> | Dashboard | `docs/screenshots/dashboard.png` |
> | Dark theme | `docs/screenshots/dark-theme.png` |

Placeholder editorial imagery ships in `public/images/` (hero + one photo per category + fallback).

---

## Local development

```bash
npm install --legacy-peer-deps      # --legacy-peer-deps is required on npm 10.8.x
cp .env.example .env.local          # then fill in the values below
npm run dev                         # http://localhost:3000
```

The Express API must run at the URL in `NEXT_PUBLIC_API_URL` (default `http://localhost:5001`):

```bash
cd ../studiospace-server && npm install --legacy-peer-deps && npm run dev
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (Next 16 + React Compiler rules) |
| `npm run typecheck` | `next typegen && tsc --noEmit` |

---

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | yes | Public origin, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | yes | Express origin used by the rewrite proxy |
| `API_URL` | recommended | Server-side override of the API origin (production) |
| `BETTER_AUTH_URL` | yes | Must match the public origin |
| `BETTER_AUTH_SECRET` | yes | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `MONGODB_URI` | yes | Same database the API uses (Better Auth adapter writes `users`) |
| `DB_NAME` | yes | e.g. `studiospace` |
| `INTERNAL_API_SECRET` | yes | **Must equal** the server's `INTERNAL_API_SECRET` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Enables Google login — [console.cloud.google.com](https://console.cloud.google.com/apis/credentials), redirect URI `{BETTER_AUTH_URL}/api/auth/callback/google` |
| `IMGBB_API_KEY` / `NEXT_PUBLIC_IMGBB_API_KEY` | optional | Uploads run through the server key; the public key is only a fallback. Get one free at [api.imgbb.com](https://api.imgbb.com/) |

Never commit `.env*` files. Only `NEXT_PUBLIC_*` variables reach the browser.

---

## Routes

**Public:** `/` · `/studios` · `/studios/[id]` · `/about` · `/how-it-works` · `/terms` · `/privacy` ·
`/login` · `/register`

**Private** (proxy-protected, `callbackUrl` round-trip): `/host` · `/add-studio` · `/my-listings` ·
`/studios/edit/[id]` · `/my-bookings` · `/dashboard` · `/profile` · `/wishlist`

**System:** `not-found.tsx` (custom 404) · `error.tsx` · `loading.tsx` · `/api/auth/[...all]` ·
`/api/session`

### Navigation map

```
Navbar: Home · Explore Studios · How It Works · About Us
        (auth) host icon → Host Panel (/host)
        (auth) avatar → Host Panel · Dashboard · Add New Studio ·
                         My Studio Listings · My Bookings · Wishlist · Profile · Logout
        (guest) Log in · Sign up
Footer: brand + mission · quick links · 6 categories · socials (IG/FB/LinkedIn/X) · newsletter
```

---

## Architecture notes

- **Same-origin API.** The browser only calls `/api/*`. `next.config.ts` rewrites those paths to the
  Express origin (`API_URL ?? NEXT_PUBLIC_API_URL`), excluding `/api/auth/*` and `/api/session`,
  which are real Next route handlers.
- **Two cookies.** Better Auth's session cookie proves identity to Next.js; a signed HTTPOnly JWT
  (`studiospace_session`) authorises Express mutations. `POST /api/session` verifies the Better Auth
  session, then exchanges it server-to-server (`x-internal-secret`) for the JWT.
- **No tokens in localStorage.** `src/lib/api.ts` re-mints the JWT once on a 401 and replays the
  request, so a page refresh never logs the user out.
- **Proxy is not the security boundary.** `src/proxy.ts` only redirects unauthenticated navigation;
  every Express endpoint re-verifies the JWT and ownership.

---

## Deployment (Vercel)

1. Push this repo to GitHub, import it in Vercel, framework preset **Next.js**.
2. Add every variable from the table above (`NEXT_PUBLIC_API_URL`/`API_URL` = your Render URL,
   `NEXT_PUBLIC_APP_URL`/`BETTER_AUTH_URL` = the Vercel domain).
3. Set the server's `CLIENT_URL` to the Vercel domain so credentialed CORS matches.
4. Add `https://<vercel-domain>/api/auth/callback/google` to the Google OAuth client.
5. Deploy, then test every route with a hard refresh (no 404s, session survives reload).

---

## Examiner / testing guide

No credentials are invented. Two accounts were created through the **real registration flow** against
the current development database — treat them as throwaway dev accounts and create your own if you
prefer:

| Role | Email | Password |
| --- | --- | --- |
| Host | `host.test@studiospace.dev` | `Studio123` |
| Renter | `guest.test@studiospace.dev` | `Studio123` |

> If you deploy with a fresh database, register new accounts instead — the table above only exists
> in the database that was seeded during development.

**Register / log in.** `/register` → name, email, optional photo URL, password (min 6 chars, at least
one uppercase and one lowercase) → redirected to `/login` (registration intentionally does not
auto-login) → sign in. Google login works once `GOOGLE_CLIENT_ID`/`SECRET` are set.

**Create a studio.** Log in → navbar avatar → *Add New Studio* (or `/add-studio`) → upload a cover
image (needs `IMGBB_API_KEY`) or paste a URL → publish → redirected to `/my-listings`.

**Book a studio.** Open any `/studios/[id]` → *Book This Studio* → pick a future date and times →
total preview → *Confirm Booking* → booking appears as **Pending** in `/my-bookings`;
`/dashboard` → *Incoming reservations* shows it for the host.

**Who confirms a booking?** There is no separate admin panel: the **host who owns the
studio** confirms it. Sign in as the host → `/dashboard` → *Incoming reservations* →
**Confirm** (or *Decline*). Seeded demo listings belong to a placeholder host nobody can
log in as, so if you book a seeded studio the request stays *Pending*. Either register a
second account and create your own listing, or make your account the host of the seeded
listings with the server's `npm run make-host -- you@example.com`.

**Owner permissions.** As the host, confirm the request. As another account, try
`PATCH /api/host/bookings/<id>/status` with your own booking → `403`. Editing someone else's studio
via `/studios/edit/<their-id>` shows the “Not your listing” panel.

**Double-booking.** With booking A confirmed (10:00–13:00), request 12:00–15:00 for the same studio
and date → toast shows *“This studio is already booked for the selected time. Please choose another
time slot.”* (HTTP 409). 15:00–17:00 succeeds. Cancelling A frees the slot again.

**JWT protection.** `curl -X POST http://localhost:3000/api/studios -H 'Content-Type: application/json' -d '{}'`
→ `401`. A tampered cookie value also returns `401` (`Invalid authentication token.`).

---

## Known limitations

- Payments are not processed — deposits and totals are calculated and recorded only.
- Newsletter signup stores the email in the API's `newsletter` collection; no email is sent.
- Google login requires your own OAuth credentials.
- 15 lint warnings remain, all from the React Compiler advisory
  (`react-hooks/set-state-in-effect`) and React Hook Form's `watch()` — documented in
  `eslint.config.mjs`; there are 0 lint **errors**.
