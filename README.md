# Womania by Dola

Storefront + admin CMS for a handloom boutique in Jalpaiguri. Next.js 16 (App Router) deployed to **Cloudflare Workers** via OpenNext, with **D1** (SQLite) for orders and CMS content and **R2** for admin image uploads. Card payments use Cashfree Hosted Checkout and notify the owner over WhatsApp/email after payment is verified.

Live: https://womaniabydola.com — apex and www are connected to the production Worker. The workers.dev endpoint remains available for in-flight payment callbacks.

## Run locally

```bash
cp .dev.vars.example .dev.vars   # set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm install
npm run db:migrate:local         # create tables in the local D1
npm run db:seed:local            # load the catalog/content snapshot from db/seed.sql
npm run dev                      # http://localhost:3000 (Next dev server + local D1/R2)
```

For local card-payment testing, add Cashfree Sandbox credentials to the gitignored `.dev.vars.sandbox`. `npm run dev -- --port 3001` loads it over `.dev.vars`, keeping live credentials separate:

```text
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_ENV=sandbox
CASHFREE_API_VERSION=2025-01-01
```

In Cashfree Merchant Dashboard select **Test Environment → Developers → API Keys → View API Key**. Copy the App ID and secret into that file, not chat or Git. Production uses the separate pair under **Switch to Prod**. Pin `CASHFREE_API_VERSION=2025-01-01`, the version tested by this integration. **No separate `CASHFREE_WEBHOOK_SECRET` is needed**: Cashfree PG signs webhooks with `CASHFREE_CLIENT_SECRET`; the obsolete variable is ignored.

Under **Developers → Webhooks**, add `/api/payments/cashfree/webhook` on the appropriate public origin, version `2025-01-01`, with success payment, failed payment, and user dropped payment events. Localhost cannot receive provider webhooks. The isolated test storefront is `https://womania-payments-sandbox.karao-digital.workers.dev`, configured by `wrangler.sandbox.jsonc` with a separate D1 database. Sandbox notifications are suppressed. Keep every credential server-side.

`next dev` gets the Cloudflare bindings through `initOpenNextCloudflareForDev()` in `next.config.ts`; the local database lives under `.wrangler/state/`. The development launcher refuses production mode. `npm run preview` uses Wrangler's `.dev.vars` directly instead of this launcher; do not use it for payment tests while that file contains production credentials.

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
npx wrangler secret put CASHFREE_CLIENT_ID
npx wrangler secret put CASHFREE_CLIENT_SECRET
npx wrangler secret put CASHFREE_ENV            # production for live keys
npx wrangler secret put CASHFREE_API_VERSION    # 2025-01-01
npm run db:migrate:remote
npm run deploy
```

Use sandbox credentials only on the isolated sandbox deployment. Production must use live credentials with `CASHFREE_ENV=production`. Orders explicitly request credit/debit cards (`cc,dc`); COD is disabled. Cashfree must approve the checkout hostname under **Developers → Whitelisting**. The final domain must be routed to this app before it can serve this checkout.

Run `node --test scripts/test-payments.mjs`, lint, typecheck and the OpenNext build before deployment. Failed payment attempts can retry the same order. Only provider-confirmed success with matching amount/currency marks an order paid. The signed webhook and browser-return checks share idempotent reconciliation. A five-minute Cron Trigger also checks expired reservations. Ambiguous provider errors retain stock; confirmed expired/terminated orders release it exactly once. Orders never created at Cashfree release after their reservation plus a five-minute grace period and an authenticated `order_not_found` response. Review persistent reconciliation errors in Worker logs.

Checkout stores a random recovery reference in browser local storage before submitting; reloads recover the existing payment. Unknown payment status never offers a fresh payment. Edited details require resolving the previous order first. Expired-order reconciliation runs only through the scheduled endpoint, with leases and retry backoff so persistent failures cannot monopolize the sweep.

Apply migration `0008_payment_recovery.sql` before deploying these recovery changes. Notification delivery uses durable jobs, five-minute leases and retry backoff capped at one hour. The production cron repairs missing jobs for paid orders and retries failed deliveries. Admin orders includes a failed-notification retry button; successfully sent channels are not intentionally resent. Delivery is at-least-once: a provider accepting a message immediately before a worker crash can cause a duplicate on retry. Configure the WhatsApp/email credentials for delivery to succeed. Refund initiation/settlement is not automated and must be handled in Cashfree. Admin payment status cannot override provider-verified online payment status.

`SITE_URL` (canonical origin for sitemap/OG/JSON-LD and payment return/notify URLs) is `https://womaniabydola.com` in `wrangler.jsonc`. Apex and www custom domains are declared there too. Cloudflare resources: D1 `womania-db`, R2 bucket `womania-media`, plus three rate-limit bindings (login, orders, quotes), all declared in `wrangler.jsonc`.

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
