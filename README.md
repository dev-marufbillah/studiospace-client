# StudioSpace — Peer-to-Peer Creative Workspace & Studio Sharing Platform

**🔗 Live site: <https://studiospace-delta.vercel.app>**
**🔌 Live API: <https://studiospace-api-seven.vercel.app>** · health: [`/api/health`](https://studiospace-api-seven.vercel.app/api/health)
**🖥️ API repository:** <https://github.com/dev-marufbillah/studiospace-server>

StudioSpace is a marketplace for creators — filmmakers, photographers, podcasters and musicians.
Hosts publish cyc-wall photo studios, sound stages, podcast lounges, music suites and workshops with
hourly rates and deposits; creators search, filter, inspect availability and reserve real time slots
that the host then confirms.

- **Discover & book in one flow** — Swiper hero slider, six dynamically featured studios
  (`.limit(6)`), five category tiles that deep-link into `/studios?category=…`, live search with
  category / city / price / rating / capacity / amenity filters, four sort modes and pagination.
- **Complete CRUD with real image uploads** — add, edit and delete studio listings (imgbb upload or
  image URL, gallery, amenity/equipment tag editors, read-only owner name + email), managed from
  the required **My Studio Listings** page (`/my-listings`) and — as a bonus — the *Host Panel*
  (`/host`), every destructive action behind a custom confirm modal.
- **Secure auth & booking lifecycle** — Better Auth email/password + Google OAuth; a signed HTTPOnly
  JWT authorises every mutation; bookings move Pending → Confirmed → Completed / Cancelled, with
  double-booking prevention (HTTP 409), owner-only approval (403), server-side pricing and a
  downloadable **PDF invoice** for confirmed bookings.
- **Built for demos, not just happy paths** — Sonner toasts everywhere (no `window.alert`), branded
  skeletons, friendly empty states, custom 404 + error boundary, light/dark theme toggle, wishlist
  hearts, and layouts verified on mobile, tablet and desktop.
- **Tech stack** — Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Better Auth
  (MongoDB adapter) · Swiper · React Hook Form + Zod · Sonner · next-themes · jsPDF · Lucide icons ·
  Express 5 + TypeScript + MongoDB Atlas on the API side.

## Examiner quick start

| Role | Email | Password | What it unlocks |
| --- | --- | --- | --- |
| Host (owns 6 seeded studios) | `host.test@studiospace.dev` | `Studio123` | Host Panel, My Studio Listings, confirm/decline incoming bookings |
| Renter | `guest.test@studiospace.dev` | `Studio123` | Existing bookings, wishlist, booking flow |

- **Confirm a booking:** sign in as the host → `/host` (or `/dashboard`) → *Incoming reservations* →
  a **Pending** request is already waiting (Luminous Daylight Photo Studio) → **Confirm**.
- **Double-booking proof:** with that booking confirmed, try booking the same studio and date for an
  overlapping time → toast *“This studio is already booked for the selected time…”* (HTTP 409).
- **Ownership proof:** while signed in as the renter, `PATCH /api/host/bookings/<id>/status` → `401`/`403`;
  opening `/studios/edit/<someone-else-id>` shows the “Not your listing” panel.
- **Google login** works once `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set; without them the
  button shows a friendly toast instead of failing silently.

## Who owns what — listings and booking confirmations

This follows the brief exactly: **a listing belongs to the account that created it**, and the
owner-scoped pages read that ownership from the stored `ownerId` / `ownerEmail` on the studio
document (`/api/my-listings` filters by owner, it does not filter by role).

- **My Studio Listings (`/my-listings`)** — required page: *“showing user-owned spaces (ownerEmail
  match) with Update and Delete buttons.”* A brand-new account therefore has **0 listings** until it
  publishes one with **Add New Studio**; the table is empty by design, not by error.
- **Who confirms a booking?** The brief leaves booking management to the studio owner, so the
  **owner of that listing** is the only account allowed to move a request from `Pending` to
  `Confirmed` / `Completed`. Anyone else gets **403** (`You are not authorized to manage this
  booking.`) and an unauthenticated request gets **401**.
- **Host Panel (`/host`) is a bonus, not a brief requirement.** It is a convenience screen built on
  top of the same owner-scoped data: counts of active listings / pending / confirmed / booked value,
  status tabs and one-click Confirm · Mark completed · Decline, plus the owners' listing manager.
  Everything it does is also reachable through the required pages (`/my-listings`,
  `/studios/edit/[id]`, `/dashboard`).
- **What an examiner sees:** the seeded database gives `host.test@studiospace.dev` six listings and a
  **Pending** request, so the whole owner flow can be demonstrated without creating data first.

## Local setup (two terminals)

```bash
# 1) API — http://localhost:5001
git clone https://github.com/dev-marufbillah/studiospace-server && cd studiospace-server
npm install --legacy-peer-deps
cp .env.example .env        # fill MONGODB_URI, JWT_SECRET, INTERNAL_API_SECRET
npm run seed && npm run dev

# 2) Web — http://localhost:3000
git clone https://github.com/dev-marufbillah/studiospace-client && cd studiospace-client
npm install --legacy-peer-deps
cp .env.example .env.local  # same MONGODB_URI + INTERNAL_API_SECRET, BETTER_AUTH_SECRET
npm run dev
```

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

## Live tour (open these on the deployed site)

| Page | Link |
| --- | --- |
| Home — hero slider, featured studios, categories | <https://studiospace-delta.vercel.app> |
| Explore studios — filters, sorting, pagination | <https://studiospace-delta.vercel.app/studios> |
| Studio detail — gallery, reviews, booking modal | <https://studiospace-delta.vercel.app/studios/6ae769176c4132584c18f934> |
| Login / Register | <https://studiospace-delta.vercel.app/login> · <https://studiospace-delta.vercel.app/register> |
| Host Panel (sign in as host) | <https://studiospace-delta.vercel.app/host> |
| My Studio Listings · My Bookings · Wishlist | `/my-listings` · `/my-bookings` · `/wishlist` |

Placeholder editorial imagery ships in `public/images/` (hero + one photo per category + fallback),
so the site never shows a broken image, even offline.

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

## Deployment (Vercel — live)

Both apps run on Vercel; the API is a single serverless function that boots the same Express app
used locally (`api/index.js` + a `vercel.json` rewrite that forwards the original URL).

1. **Web:** <https://studiospace-delta.vercel.app> — framework preset **Next.js**.
2. **API:** <https://studiospace-api-seven.vercel.app> — Node function, `includeFiles: dist/**`.
3. Web env: `NEXT_PUBLIC_API_URL` / `API_URL` = the API domain, `NEXT_PUBLIC_APP_URL` /
   `BETTER_AUTH_URL` / `TRUSTED_ORIGINS` = the web domain, plus `MONGODB_URI`, `DB_NAME`,
   `BETTER_AUTH_SECRET` and the shared `INTERNAL_API_SECRET`.
4. API env: `MONGODB_URI`, `DB_NAME`, `JWT_SECRET`, `INTERNAL_API_SECRET`, `CLIENT_URL` = web domain.
5. Google OAuth redirect URI: `https://studiospace-delta.vercel.app/api/auth/callback/google`.
6. Redeploy → hard-refresh every route (no 404s, session survives reload).

---

## Examiner / testing guide

Two accounts were created through the **real registration flow** against the production database and
are ready to use on the live site (the host already owns six listings and has bookings):

| Role | Email | Password |
| --- | --- | --- |
| Host | `host.test@studiospace.dev` | `Studio123` |
| Renter | `guest.test@studiospace.dev` | `Studio123` |

> If you deploy against a fresh database, register new accounts instead — these two live in the
> Atlas database the production deployment points at.

**Register / log in.** `/register` → name, email, optional photo URL, password (min 6 chars, at least
one uppercase and one lowercase) → redirected to `/login` (registration intentionally does not
auto-login) → sign in. Google login works once `GOOGLE_CLIENT_ID`/`SECRET` are set.

**Create a studio.** Log in → navbar avatar → *Add New Studio* (or `/add-studio`) → upload a cover
image (needs `IMGBB_API_KEY`) or paste a URL → publish → redirected to `/my-listings`.

**Book a studio.** Open any `/studios/[id]` → *Book This Studio* → pick a future date and times →
total preview → *Confirm Booking* → booking appears as **Pending** in `/my-bookings`;
`/dashboard` → *Incoming reservations* shows it for the host.

**Who confirms a booking?** There is no separate admin panel: the **host who owns the
studio** confirms it. Sign in as `host.test@studiospace.dev` → `/host` (or `/dashboard`) →
*Incoming reservations* → **Confirm** (or *Decline*). That account already owns six seeded
studios (Luminous Daylight, Sound Stage One, The Quiet Room, Harmony Recording Suite,
Terracotta Art Workshop, Atelier Creative Workspace) and has a **Pending** request waiting,
so the reviewer can complete the full lifecycle without setting anything up.

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
