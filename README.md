# Womania by Dola

Storefront + admin CMS for a handloom boutique in Jalpaiguri. Next.js 16 (App Router) deployed to **Cloudflare Workers** via OpenNext, with **D1** (SQLite) for orders and CMS content and **R2** for admin image uploads. Orders are cash-on-delivery and notify the owner over WhatsApp/email.

Live: https://womania-by-dola.karao-digital.workers.dev (until `womaniabydola.com` is attached)

## Run locally

```bash
cp .dev.vars.example .dev.vars   # set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm install
npm run db:migrate:local         # create tables in the local D1
npm run db:seed:local            # load the catalog/content snapshot from db/seed.sql
npm run dev                      # http://localhost:3000 (Next dev server + local D1/R2)
```

`next dev` gets the Cloudflare bindings through `initOpenNextCloudflareForDev()` in `next.config.ts`; the local database lives under `.wrangler/state/`. To run the real Workers runtime locally: `npm run preview`.

## Admin

`/admin` — username `admin`. On a fresh database the first login uses the `ADMIN_PASSWORD` secret and creates the account; after that, change the password from **Admin → Settings** (stored as a PBKDF2 hash in the `admin_users` table). The secret is ignored once an account exists.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Standard Next.js lifecycle |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm run preview` | OpenNext build + run in local workerd |
| `npm run deploy` | OpenNext build + deploy to Cloudflare |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` after editing `wrangler.jsonc` |
| `npm run db:migrate:local` / `db:migrate:remote` | Apply `migrations/*.sql` to local / production D1 |
| `npm run db:seed:local` / `db:seed:remote` | Load `db/seed.sql` (initial catalog + content) |
| `npm run db:export` | Dump production D1 to `db/backup.sql` |

## Deploying

```bash
npx wrangler login
npx wrangler secret put ADMIN_PASSWORD          # bootstrap password (first login only)
npx wrangler secret put ADMIN_SESSION_SECRET    # long random string; rotate to log everyone out
npx wrangler secret put WHATSAPP_API_TOKEN      # optional, Meta Cloud API
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
npx wrangler secret put CALLMEBOT_API_KEY       # optional, fallback channel
npx wrangler secret put RESEND_API_KEY          # optional, email backup
npm run db:migrate:remote
npm run deploy
```

`SITE_URL` (canonical origin for sitemap/OG/JSON-LD) is a plain var in `wrangler.jsonc` — change it when the custom domain is attached. Cloudflare resources: D1 `womania-db`, R2 bucket `womania-media`, plus three rate-limit bindings (login, orders, quotes), all declared in `wrangler.jsonc`.

**Free-plan budget:** 100k Worker requests/day, D1 5M row reads / 100k writes per day (hard errors past that), R2 10 GB. D1 keeps 7 days of point-in-time history; run `npm run db:export` for an offline copy.

## Customer accounts

Shoppers can register at `/account/register` (email + password, PBKDF2-hashed in the `customers` table), then see orders placed while signed in, save delivery addresses (pre-filled at checkout) and keep a wishlist that syncs across devices. Guests still check out normally and keep a device-local wishlist. There is no email-based password reset yet — the owner can help via WhatsApp. Admin → Customers lists accounts with order counts.

## Notifications

On each order the server tries, in sequence: owner WhatsApp → customer WhatsApp → owner email. WhatsApp uses the Meta Cloud API when `WHATSAPP_API_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` are set, falling back to CallMeBot (`CALLMEBOT_API_KEY`). Email uses Resend (`RESEND_API_KEY`). A missing credential never blocks an order; the failure is recorded on the order row and shown in `/admin/orders`.

Message bodies are editable in **Admin → Content → WhatsApp templates** using `{{placeholder}}` syntax.

## Where things are edited

| Thing | Admin page |
|---|---|
| Products, stock, sale price, images | `/admin/products` |
| Coupons | `/admin/offers` |
| Header / footer navigation | `/admin/navigation` |
| Homepage sections & order, hero, banners, testimonials | `/admin/homepage` |
| Announcement bar, About/Contact copy, policies, social links, shipping rules, WhatsApp templates | `/admin/content` |
| Site/page titles, descriptions, keywords, share images, category SEO, business details (structured data) | `/admin/seo` |
| Uploaded images (browse, upload, delete) | `/admin/media` |
| Logo, brand colours | `/admin/appearance` |
| Owner WhatsApp number, notification email, flat shipping rate, admin password | `/admin/settings` |

See `CLAUDE.md` for architecture notes.
