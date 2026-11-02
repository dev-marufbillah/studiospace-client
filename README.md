# StudioSpace — Peer-to-Peer Creative Workspace & Production Studio Sharing Platform

A market place where studio owners list creative spaces — photography cyc walls, film stages,
podcast lounges, music suites and art workshops — and creators discover, filter, inspect and book
them with transparent hourly pricing, deposit rules and real-time booking status.

**🌐 Live site → <https://studiospace-delta.vercel.app>**
**⚙️ Live API → <https://studiospace-api-seven.vercel.app/api/health>**

---

## ✨ Features

- **Home** — Swiper hero slider (3 slides, fade + autoplay, *Explore Studios* / *Host Your Space*
  CTAs), **6 featured studios** fetched from MongoDB (`.limit(6)`, best rated first), 5 category
  tiles that deep-link to `/studios?category=…`, a 4-step “How booking works” band and a host
  guarantee section.
- **Explore studios** — server-side search plus category, city, price, rating, capacity and amenity
  filters, 4 sort modes, pagination, URL query sync and a mobile filter drawer.
- **Studio details** — gallery carousel with thumbnails, specs, host card, amenity/equipment chips,
  reviews with star rating, and a **“Book Workspace Now”** button that opens the booking modal.
- **Full studio CRUD** — `/add-studio` (image upload through imgbb, gallery + amenity + equipment tag
  editors, read-only host name/email), `/studios/edit/[id]` (pre-filled, owner only), `/my-listings`
  (owner-scoped table with Update / Delete behind a custom confirm modal) and an owner-scoped
  DELETE API.
- **Bookings** — reservation saved as `Pending` with server-authoritative pricing, four status
  states (`Pending · Confirmed · Completed · Cancelled`), cancellation with confirmation dialog and a
  **downloadable PDF invoice** for confirmed slots. Studio owners confirm or decline requests from
  the Host Panel (`/host`).
- **Auth** — email/password via Better Auth + MongoDB adapter, Google OAuth, password rules
  (uppercase + lowercase + 6 characters) enforced in the form, avatar dropdown (Dashboard · Add New
  Studio · My Studio Listings · My Bookings · Logout) and proxy-protected private routes with a
  `callbackUrl` round-trip, so a signed-in user is never bounced to `/login` on reload.
- **Polish** — skeleton loaders, branded empty states with CTAs, error panels with retry, custom 404
  page, wishlist, dark/light theme toggle, Sonner toasts everywhere (no `window.alert`, no
  *lorem ipsum*), and a responsive layout from 360 px to 1920 px.

## 🧱 Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Swiper, React Hook Form + Zod, Sonner, next-themes, jsPDF, Lucide icons |
| Auth | Better Auth (MongoDB adapter) with a JWT stored in an **HTTPOnly** cookie |
| Backend | Express 5, TypeScript, MongoDB Atlas, Zod validation, helmet + rate limiting |
| Hosting | Vercel (client and API, two projects) |

## 🚀 Local setup

Two terminals — API first, then the web app.

```bash
# 1) API — http://localhost:5001
git clone https://github.com/dev-marufbillah/studiospace-server
cd studiospace-server
npm install --legacy-peer-deps
cp .env.example .env          # MONGODB_URI, DB_NAME, JWT_SECRET, INTERNAL_API_SECRET, IMGBB_API_KEY
npm run dev

# 2) Web — http://localhost:3000
git clone https://github.com/dev-marufbillah/studiospace-client
cd studiospace-client
npm install --legacy-peer-deps
cp .env.example .env.local    # NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET,
                              # MONGODB_URI, DB_NAME, INTERNAL_API_SECRET (same as server)
npm run dev
```

Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` enable the Google button
(redirect URI `{BETTER_AUTH_URL}/api/auth/callback/google`), `IMGBB_API_KEY` enables image uploads.
Never commit `.env` files.

## 🔑 Examiner test credentials

| Role | Email | Password | What it unlocks |
| --- | --- | --- | --- |
| Host (owns 6 seeded studios) | `host.test@studiospace.dev` | `Studio123` | Host Panel, My Studio Listings, confirm incoming bookings |
| Renter | `guest.test@studiospace.dev` | `Studio123` | existing bookings, wishlist, booking flow |

The database also contains 12 seeded studios with real imagery, so every page has content before you
create anything.

## ✅ Requirement walkthrough (about 3 minutes)

1. **Register** at `/register` → password rules are shown live → redirects to `/login`; or sign in
   with Google.
2. **Add a studio** as `host.test…` → `/add-studio` → upload an image, add amenities → success toast
   → redirect to `/my-listings` where the card appears (owner-email match).
3. **Update / Delete** from `/my-listings` → pre-filled form → toast → back to the list; Delete opens
   a confirmation modal, then removes the document from MongoDB.
4. **Book** as `guest.test…` → open any studio → *Book Workspace Now* → pick a date and time range →
   the booking is stored as **Pending** and shows a status badge in `/my-bookings` with a Cancel option.
5. **Confirm** as the host → `/host` → pending request → **Confirm** → the renter sees *Confirmed* and
   can download the PDF invoice.

**Challenge proofs**

| Challenge | How to verify |
| --- | --- |
| 1 · JWT in HTTPOnly cookies | `POST /api/studios` (or DELETE / POST booking) without a cookie → **401**; the cookie is `HttpOnly`, `SameSite`, not readable from JS |
| 2 · Double-booking prevention | Confirm a booking, then request an overlapping slot on the same studio and date → **409** with a clear message |
| 3 · Theme customisation | Toggle in the navbar switches the whole site between light and dark and persists |
| Owner-only mutations | Another account calling `PUT /api/studios/<id>` / `PATCH /api/host/bookings/<id>/status` → **403** |

## 🔌 API endpoints (Express)

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/studios` | search + filters + sort + pagination |
| GET | `/api/studios/featured` | 6 highest-rated studios |
| GET · PUT · DELETE | `/api/studios/:id` | read public, write owner-only (JWT) |
| POST | `/api/studios` | create listing (JWT) |
| GET | `/api/my-listings` | studios owned by the caller |
| POST | `/api/bookings` | create reservation → `Pending` |
| GET | `/api/my-bookings` | caller's reservations |
| PATCH | `/api/bookings/:id` | cancel a pending booking |
| GET · PATCH | `/api/host/bookings`, `/api/host/bookings/:id/status` | incoming requests, owner-only status changes |
| GET · POST · DELETE | `/api/wishlist` | saved studios |
| GET · POST · DELETE | `/api/reviews` | per-studio reviews, rating recompute |
| POST | `/api/upload` | imgbb proxy (authenticated) |
| POST | `/api/newsletter` | footer subscription |
| GET · PATCH | `/api/users/me` | profile read/update |
| GET | `/api/health` | uptime probe |

## 🗺️ Routes

**Public:** `/` · `/studios` · `/studios/[id]` · `/how-it-works` · `/about` · `/terms` · `/privacy` ·
`/login` · `/register`

**Private:** `/dashboard` · `/add-studio` · `/my-listings` · `/studios/edit/[id]` · `/my-bookings` ·
`/host` · `/wishlist` · `/profile`

## 📌 Notes

- Private routes are guarded by `src/proxy.ts`; a request without a session cookie gets
  `307 → /login?callbackUrl=<route>` and returns to that route after signing in.
- Ownership is data-driven: a listing belongs to the account that created it (`ownerId` /
  `ownerEmail`), so any signed-in user can become a host by publishing a studio — no role switch.
- Every mutation re-verifies the HTTPOnly JWT on the Express side; the client never sends an owner id
  in a request body.
- Booking price is recomputed on the server (`hourlyRate × hours + securityDeposit`), never trusted
  from the browser.
