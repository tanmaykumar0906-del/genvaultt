# GenVault — full-stack project

One Next.js (App Router) project containing both halves of the site:

- **Frontend** — `components/StoreApp.jsx`, mounted at `app/page.tsx`.
  Home, Shop, Product Detail, Journal, About, cart drawer, the animated
  3D vault hero, all in one client component (this is the same demo
  shown earlier in chat, now wired to fetch real data).
- **Backend** — `app/api/**` (Next.js Route Handlers) + `supabase/*.sql`
  (Postgres schema + seed data) + `lib/supabase/*` (client helpers) +
  `middleware.ts` (protects `/admin/*`).

## How frontend and backend connect

`StoreApp.jsx` calls `GET /api/products` on load. If that call succeeds
(i.e. you've set up Supabase — see below), the storefront renders your
real, live product data — the API route reads it straight from the
`products` table. If the call fails (no Supabase configured yet, or
you're just browsing offline), it silently falls back to a small local
demo array, so `npm run dev` works immediately with zero setup and you
can see the whole site before touching a database.

Other backend routes (`/api/orders`, `/api/blog`, `/api/wishlist`,
`/api/upload`, `/api/auth/*`) are ready to call from the frontend the
same way — the checkout button, blog CMS pages, etc. currently render
UI only and aren't calling them yet; that's the next wiring step.

## 1. Run it immediately (demo data, no backend needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — this runs the full frontend against the
local demo product array.

## 2. Connect the real backend (Supabase)

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and fill in your project URL +
   anon key + service role key.
4. Promote your own account to admin after signing up once:
   ```sql
   update profiles set role = 'admin' where id = 'your-auth-user-uuid';
   ```
5. Restart `npm run dev` — the homepage/shop will now pull live rows
   from Postgres instead of the demo array.

## Project map

| Path | What it is |
|---|---|
| `app/page.tsx` | Mounts the storefront |
| `components/StoreApp.jsx` | Entire frontend — nav, hero, 3D vault, shop, PDP, cart, journal, about, footer |
| `app/api/products` | Public product list + admin create |
| `app/api/products/[id]` | Read/update/delete one product |
| `app/api/orders` | Checkout — server-side pricing, stock decrement |
| `app/api/blog`, `app/api/blog/[slug]` | Journal CMS |
| `app/api/wishlist` | Customer wishlist |
| `app/api/upload` | Admin product photo upload to Supabase Storage |
| `app/api/admin/dashboard` | Admin overview stats |
| `app/api/auth/*` | Signup / login / logout / password reset |
| `middleware.ts` | Blocks `/admin/*` for non-admins |
| `supabase/schema.sql` | Tables + Row Level Security policies |
| `supabase/seed.sql` | Sample catalog matching the frontend demo |

## Currency

All prices are in Indian Rupees. Database money columns are `*_paise`
(₹1 = 100 paise) — the standard way to store currency as an integer
and avoid floating-point rounding errors. The frontend divides by 100
and formats with `Intl`-style Indian digit grouping (₹1,299).

## Still needed before this is production-ready

- **Payments** — `/api/orders` creates the order row but doesn't call a
  payment provider yet. Wire Razorpay (or Stripe) before the order is
  marked `pending`→`paid`, and flip that status from the provider's
  **webhook**, not from client code.
- **Admin dashboard UI, blog editor UI, checkout form UI** — the API
  routes exist; the admin-facing pages to call them don't yet.
- **Product photos** — currently styled placeholder blocks. Upload real
  photos through `/api/upload` once you have licensed/your-own
  photography of the actual pieces (thrift stock is one-of-a-kind, so
  real photos of the real item matter here).
- **Transactional email** (order confirmation, password reset, drop
  alerts) — not wired up; pair with Resend/Postmark or Supabase's
  built-in auth email.
