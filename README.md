# FAIRYTALE Café & Restaurant — Premium Cinematic Website

React + Vite frontend · Flask + SQLAlchemy backend · SQLite (dev) / PostgreSQL (production)

> Kammanahalli, Bengaluru · *Good Food. Great Vibes. Unforgettable Moments.*

## Build status

| Phase | Scope | Status |
|------|-------|--------|
| 1 | Architecture, design system, frontend foundation | **Done** |
| 2 | Cinematic loader, hero, navigation, about, motion system | **Done** |
| 3 | Menu, offers, celebrations, gallery | **Done** |
| 4 | Reservations, contact forms, Flask API | **Done** |
| 5 | Admin dashboard, authentication, managing bookings/messages/menu/offers/hours | **Done** |
| 6 | Performance, responsive QA, deployment | **Done** |

## Prerequisites

- Node.js **18.18+** (20 LTS recommended) and npm
- Python **3.10+**
- Git, Visual Studio Code

## Run the frontend

```bash
cd frontend
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. During development, `http://localhost:5173/styleguide` shows the design system.

Production build check:

```bash
npm run build
npm run preview             # http://localhost:4173
```

## Run the backend (Flask API)

```bash
cd backend
python -m venv venv
# Windows PowerShell:  venv\Scripts\Activate.ps1
# macOS / Linux:       source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
python scripts/init_db.py   # creates the SQLite tables (one time; re-run after updating, it only adds new tables)
python scripts/create_admin.py   # creates the owner login (asks for email + password)
python wsgi.py              # http://127.0.0.1:5000
```

Run the frontend in a second terminal as above. Vite proxies `/api` to Flask, so no CORS setup is needed in development. Check it works: http://127.0.0.1:5000/api/health returns `{"status":"ok"}`.

Tests (optional): `pip install -r requirements-dev.txt` then `pytest` from `backend/`.

### API (Phase 4)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness + database check |
| GET | `/api/public/content` | Menu dishes, active offers and opening hours for the public site |
| POST | `/api/reservations` | Table request. Fields: `name, phone, email?, date (YYYY-MM-DD), time (HH:MM), guests, occasion?, notes?` |
| POST | `/api/contact` | Message. Fields: `name, phone?, email?, message` (phone or email required) |

Responses are JSON. Validation failures return `422 {"message", "errors": {field: text}}`; the form shows each message beside its field. A duplicate pending request (same phone, date, time) returns the original reference instead of creating a second one.

Built-in protections: server-side validation of every field, per-IP rate limits, a hidden honeypot field, request-size cap, no contact details ever echoed back, and production refuses to start with placeholder secrets.

### Owner dashboard (Phase 5)

Open http://localhost:5173/admin and sign in with the account from `create_admin.py` (running it again for the same email resets the password). There is no default account. Passwords need 10+ characters.

| Tab | What the owner can do |
|---|---|
| Reservations | Filter, search, confirm / cancel / complete, call or WhatsApp the guest with a prefilled confirmation |
| Messages | Read, mark read/unread, reply by phone or email, delete |
| Menu | Add, edit, hide or delete dishes (name, description, price, veg marker) per category |
| Offers | Add, edit, hide or delete offers |
| Hours | Set opening hours for each day; they then appear in the Contact section |

Dishes, offers and hours reach the public site through `GET /api/public/content` (cached for 60 seconds). If the API is down, the site falls back to the copy in `content.js`, so it never shows an error. Admin routes live under `/api/admin/*` and need a Bearer token (8-hour expiry, `JWT_EXPIRES_HOURS`); login is limited to 5 attempts a minute per IP and never reveals which emails exist. The dashboard is excluded from search engines (`noindex`, `robots.txt`).

### Owner email alerts (optional)

Every request is stored in the database. To also get an email, fill `NOTIFY_EMAIL` and the `SMTP_*` values in `backend/.env` (for Gmail use an App Password). Without them, requests are stored and logged only. The dashboard above lists them either way.

## Going live (Phase 6)

| Need | Where |
|---|---|
| Compress client photos (WebP, web sizes) | `cd frontend && npm run optimize-images` |
| Responsive / accessibility smoke test | `npm run build && npm run preview`, then `npm run qa` |
| Deploy with Docker (Postgres + API + automatic HTTPS) | `docs/DEPLOYMENT.md` |
| Pre-launch manual checks, Lighthouse targets | `docs/QA-CHECKLIST.md` |
| CI (tests + build on every push) | `.github/workflows/ci.yml` |

## Project structure

```
fairytale-restaurant/
├─ README.md
├─ .gitignore
├─ .vscode/                      editor settings and recommended extensions
├─ docs/                         DEPLOYMENT.md · QA-CHECKLIST.md
├─ docker-compose.yml · .env.production.example
├─ .github/workflows/ci.yml
├─ backend/
│  ├─ requirements.txt · requirements-dev.txt
│  ├─ .env.example · wsgi.py
│  ├─ tests/                     pytest suite for the API
│  ├─ app/
│  │  ├─ config.py · extensions.py
│  │  ├─ routes/                 REST endpoints (blueprints)
│  │  ├─ models/                 SQLAlchemy models
│  │  ├─ services/               business logic
│  │  ├─ auth/                   password hashing, JWT, route guards
│  │  └─ utils/                  validation, uploads, helpers
│  ├─ scripts/                   DB init / admin seed scripts
│  └─ uploads/                   admin-uploaded images (git-ignored)
└─ frontend/
   ├─ index.html                 SEO, Open Graph, JSON-LD, fonts
   ├─ Dockerfile · Caddyfile      production image: static site + HTTPS + security headers
   ├─ scripts/                    optimize-images.mjs · qa.mjs
   ├─ vite.config.js             alias @ -> src, API proxy, code splitting, sitemap/robots generation
   ├─ package.json
   ├─ .env.example
   ├─ public/                    favicon (robots.txt and sitemap.xml are generated at build)
   └─ src/
      ├─ main.jsx · App.jsx      entry, routing, lazy routes, page transitions
      ├─ styles/                 tokens.css · base.css · utilities.css
      ├─ config/site.js          verified business details (single source of truth)
      ├─ lib/gsap.js             GSAP + ScrollTrigger registered once
      ├─ animations/presets.js   shared easing and variants
      ├─ hooks/                  usePublicContent · useMediaQuery · useReducedMotion · useDeviceCapabilities
      ├─ services/api.js         fetch wrapper for the Flask API
      ├─ components/
      │  ├─ ui/                  Button · Field · SectionHeading · GoldDivider · BrandMark · Photo · Lightbox · Seo · ErrorBoundary · RouteLoader
      │  ├─ motion/              Reveal · ImageReveal · Parallax · SplitText · Loader · GoldParticles · CustomCursor · PageTransition
      │  └─ layout/              Layout · Header · Footer · ScrollToTop
      ├─ sections/               Hero · About · Menu · Offers · Celebrations · Gallery · Reservations · Contact
      ├─ pages/                  Home · NotFound · StyleGuide (dev only)
      ├─ admin/                  owner dashboard: AdminApp · Login · Dashboard · tabs/ (lazy-loaded, outside the site shell)
      └─ assets/images/          client photography
```

## Design system

| Token | Value |
|-------|-------|
| Deep surfaces | `#04120d` · `#07211a` · `#030907` |
| Emerald | `#0b3226` → `#14654a` |
| Gold | `#c9a24b` (primary) · `#ecd48f` (highlight) · `#7d6120` (shadow) |
| Ivory text | `#f6efdc` · `#d9d1bb` · `#a9a28f` |
| Headings | Cormorant Garamond (serif) |
| Body | Jost (sans-serif) |
| Corners | 2–4px. Luxury is square-edged, not pill-shaped |
| Motion | One easing family (`presets.js`); reduced-motion respected everywhere |

All values live in `frontend/src/styles/tokens.css`. Change them there, never inline.

## Working rules

- **No invented business data.** Hours, prices, reviews and ratings come from the admin dashboard. Verified facts live in `frontend/src/config/site.js`.
- **Reduced motion and mobile.** Check `useDeviceCapabilities()` before any heavy effect (particles, 3D, custom cursor).
- **Secrets** stay in `.env` files, which are git-ignored.

## Client photography (drop-in)

Add files to `frontend/src/assets/images/`; no code changes needed. Until a photo exists, an on-brand fallback is shown.

| File name (jpg / webp / png / avif) | Used by |
|---|---|
| `hero-interior` | Hero background (warm lights, florals, interior) |
| `about-interior` | About section, large photo |
| `about-detail` | About section, small overlapping photo |
| `menu-biryani` · `menu-alfam` · `menu-kebabs` · `menu-tikka` · `menu-mocktails` | Menu, one photo per category tab |
| `celebration-birthday` · `celebration-anniversary` · `celebration-family` · `celebration-friends` | Celebrations cards |
| `gallery-01`, `gallery-02`, `gallery-03` … | Gallery. **Any** `gallery-*` file appears automatically, in numeric order |

Alt text for these images and all page copy live in `frontend/src/config/content.js`. For gallery photos, add an optional description per file under `GALLERY.alts` (screen readers). Navigation links appear automatically as sections go live (`frontend/src/config/nav.js`).

## Editing menu, offers and celebrations

All in `frontend/src/config/content.js`. **No dish, price or offer is pre-filled**, because those are business data the owner must supply.

- **Menu dishes (fallback):** the owner normally manages dishes in the dashboard, which takes priority. To seed some in code instead, fill a category's `items` with `{ name, description, price, veg }`. Prices show as ₹ only when `price` is a number; `veg: true/false` shows a veg / non-veg marker, `null` hides it. While `items` is empty the section links to the full menu on Zomato and a call button.
- **Offers:** add `{ title, description, terms }` objects to `OFFERS.items`. While empty, an "Ask what's on today" panel (WhatsApp + call) is shown.
- **Celebrations:** each card has "Reserve a table" (opens the reservation form with the occasion pre-selected) and a prefilled WhatsApp enquiry.

## Reservations and contact (Phase 4)

Copy for both sections is in `content.js` (`RESERVATIONS`, `CONTACT`). `maxGuests` and `maxAdvanceDays` there must match `MAX_PARTY_SIZE` and `MAX_ADVANCE_DAYS` in `backend/.env`. The form is a **request**, not an instant booking: guests see a reference number and a WhatsApp button to confirm, and the restaurant confirms by phone. Opening hours and table capacity are not enforced because they are business data supplied later (Phase 5).

## Before going live (checklist)

- [ ] Set `VITE_SITE_URL` to the real domain (drives canonical URLs, sitemap, robots).
- [x] Official logo installed (header, footer, intro, admin, favicons, social preview image). To change it later, see `docs/brand/README.md`.
- [ ] Confirm the WhatsApp number in `site.js` (currently assumed to equal the phone number).
- [ ] Add client photography to `src/assets/images/` (see the table above).
- [ ] Enter the real menu items and prices (or confirm that Zomato remains the menu source).
- [ ] Enter any current offers, or confirm the "ask us" panel should stay.
- [ ] Review the Menu, Offers, Celebrations, Reservations and Contact wording with the owner (written from the brand brief only).
- [ ] Backend: set strong `SECRET_KEY` / `JWT_SECRET_KEY`, `FLASK_ENV=production`, a PostgreSQL `DATABASE_URL`, and `CORS_ORIGINS` to the real domain.
- [ ] Backend: set `TRUSTED_PROXY_COUNT` (1 behind nginx / most hosts) so rate limits see real visitor IPs; use Redis for `RATELIMIT_STORAGE_URI` with several workers.
- [ ] Create the owner account on the production server with `python scripts/create_admin.py`, and choose a strong password.
- [ ] Serve the site and API over HTTPS only (the admin token travels in a header).
- [ ] Enter opening hours, dishes and offers in the dashboard (or confirm Zomato stays the menu source).
- [ ] Set `NOTIFY_EMAIL` + SMTP so the owner is alerted to every request.
- [ ] Set `VITE_API_BASE_URL` for the production frontend build.
- [ ] Agree who answers requests and how fast (the form promises a confirmation "shortly").
