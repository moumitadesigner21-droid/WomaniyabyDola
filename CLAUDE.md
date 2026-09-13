# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev                # Next dev server with local D1/R2 bindings (http://localhost:3000)
npm run lint               # ESLint (eslint-config-next core-web-vitals + typescript)
npm run typecheck          # tsc --noEmit
npm run preview            # OpenNext build + run in local workerd (closest to production)
npm run deploy             # OpenNext build + deploy to Cloudflare Workers
npm run cf-typegen         # regenerate cloudflare-env.d.ts after editing wrangler.jsonc
npm run db:migrate:local   # apply migrations/*.sql to the local D1 (.wrangler/state)
npm run db:seed:local      # load db/seed.sql into the local D1
npm run db:migrate:remote  # apply migrations to production D1
npm run db:export          # dump production D1 to db/backup.sql
```

First-time local setup: `cp .dev.vars.example .dev.vars`, then `db:migrate:local` + `db:seed:local`. There is no test suite. Both `lint` and `typecheck` are expected to pass clean; `npm run preview` + curl is the way to verify runtime behaviour. Next.js 16 with the App Router, React 19, Tailwind v4, TypeScript strict. Path alias `@/*` → `src/*`. Before writing Next.js code, consult `node_modules/next/dist/docs/` — this version differs from older training data (e.g. `params` is a Promise, `PageProps<"/route">` / `LayoutProps<"/">` helper types).

### One-off data changes

Write SQL and run it with `npx wrangler d1 execute womania-db --remote --file <file>.sql` (add `--local` for dev). `scripts/export-sqlite-to-sql.js` is the historical exporter from the pre-D1 `data/orders.db` (needs the `better-sqlite3` devDependency); `scripts/replace-shirt-backdrops.py` is an image-processing script (Pillow + rembg), unrelated to the app runtime.

## Environment variables

Secrets are Worker secrets (`npx wrangler secret put NAME`); locally they live in `.dev.vars` (see `.dev.vars.example`). Plain vars are in `wrangler.jsonc#vars`. OpenNext exposes both on `process.env`.

| Var | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Bootstraps the first `admin` account on first login when `admin_users` is empty; ignored afterwards. |
| `ADMIN_SESSION_SECRET` | HMAC key for the admin session cookie (falls back to `ADMIN_PASSWORD` if unset). |
| `SITE_URL` | Public origin for `metadataBase`, sitemap, OG, JSON-LD (`lib/site-url.ts`). Plain var in `wrangler.jsonc`. |
| `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Meta Cloud API (primary WhatsApp channel) |
| `CALLMEBOT_API_KEY` | CallMeBot fallback WhatsApp channel |
| `RESEND_API_KEY`, `ORDER_EMAIL_FROM` | Resend email backup for order notifications |

Missing credentials never throw — notification senders return `{ success: false, error }` and the failure is stored on the order row.

## Architecture

### Runtime: one Cloudflare Worker, D1 + R2

The whole app (storefront, `/admin`, `/api/*`) is a single Worker built by `@opennextjs/cloudflare` (`wrangler.jsonc`, `open-next.config.ts`). Bindings come from `getCloudflareContext()` wrapped in [`src/lib/db.ts`](src/lib/db.ts): `getDb()` (D1 `womania-db`, binding `DB`), `getMediaBucket()` (R2 `womania-media`, binding `MEDIA`), `getEnv()` (rate-limit bindings, vars). D1 is **async** — every repository function returns a Promise and every D1 query is a network hop, so batch lookups (`IN (...)`) instead of querying in loops, and wrap per-request reads in React `cache()` (see `content-repository.ts`, `site-chrome.ts`).

D1 has no interactive transactions: `batch([...])` is the atomic primitive. `createOrder` inserts the order and decrements stock in one batch, then inspects `meta.changes` on each stock statement and compensates (restores stock, deletes the order) if any line sold out — see `OutOfStockError`. D1 also rejects long `LIKE` patterns ("too complex"); use `instr()` for contains-searches.

Schema lives in `migrations/*.sql` (applied with `wrangler d1 migrations apply`). Add a new numbered file for every change; never edit an applied one. `db/seed.sql` is the export of the original catalog/content and is loaded once per database.

Free-plan limits that matter: 100k requests/day, 10 ms CPU/request, D1 5M row reads + 100k writes/day (queries error when exceeded), R2 10 GB.

### `src/lib/data.ts` is types + fallback copy, not the catalog

The live catalog and every content blob are in D1 (edit at `/admin`). `data.ts` keeps the shared `Product`/`HeroSlide` types, `shopCategories`, `collections`, and the default About/Contact/testimonial copy used when a `site_content` key is missing. Product arrays were removed when the seed moved to `db/seed.sql`.

### Data-access layering (server-only)

- `cms/products-repository.ts` — SQL for `products`/`product_images`/`product_variants`; `hydrateProducts()` attaches images and variants with one `IN` query each per page of products. **Variants:** `products.options` (JSON `[{name, values[]}]`) × `product_variants` rows keyed by a deterministic id from `cms/variants.ts#variantIdFor` (`size-m__colour-red`), each with its own stock/price/sale/image. `hasVariants(product)` decides whether stock and price come from the variant (`resolveVariantPricing`) or the product; the legacy `sizes[]` list is kept in sync by the admin form for size-only products. Cart lines and order items carry `variantId` + `variantLabel`; `createOrder` decrements `product_variants` for those lines. `cmsProductToProduct()` maps the rich `CmsProduct` down to the storefront `Product` type (sale price overrides price, `compareAtPrice`, `inStock`). `findCmsProducts({ids, slugs})` resolves a whole cart in one query.
- `cms/content-repository.ts` — `getSiteContent<T>(key, fallback)` / `upsertSiteContent(key, value)`: a JSON key-value store (`site_content` table). **Every key has a zod schema in `cms/content-schemas.ts`** (`CONTENT_SCHEMAS`) which `PATCH /api/admin/content/[key]` enforces, and a default in `cms/content-defaults.ts`. Add a new key to both before consuming it. Keys: `hero_slides`, `collection_banners`, `collections`, `how_we_work`, `testimonials`, `voices_gallery`, `about_us`, `contact_us`, `homepage_sections`, `announcement_bar`, `appearance`, `seo`, `social`, `shipping_payment`, `whatsapp_template`, `customer_whatsapp_template`, `policies`, `bestsellers_config`.
- `cms/categories-repository.ts` — the `categories` table (name, intro, image, SEO title/description, enabled) is the source for category pages; static `lib/categories.ts` remains the slug/subcategory registry and fallback.
- `lib/seo.ts` — `getSeoSettings()`, `buildMetadata()`, `buildPageMetadata(pageKey, fallback)`, `buildCategoryMetadata()`, and JSON-LD builders (`organizationJsonLd`, `websiteJsonLd`, `breadcrumbJsonLd`, `itemListJsonLd`, `productJsonLd`) rendered through `components/json-ld.tsx`. Every page's `generateMetadata` goes through these so canonical/OG/Twitter/keywords stay consistent.
- `catalog-server.ts` — storefront product queries (enabled products only). Gamcha is a *virtual* category: `getProductsByCategory("gamcha")` filters all products by "gamcha" in slug/name via `lib/gamcha.ts`, not by `category_slug`.
- `storefront.ts` — typed getters over `getSiteContent` for page-level data; `getHomepageData()` assembles the homepage.
- `orders/repository.ts` — orders CRUD, `WD-YYYYMMDD-NNNN` order numbers, idempotency-key dedup, `settings` table accessors, `getShippingPaymentConfig()` (the `shipping_payment` blob is the source of truth; `updateSettings` keeps `settings.flat_shipping_rate` in sync).
- `orders/pricing.ts` — **`quoteOrder(items, couponCode)`**: the only place totals are computed. Looks every line up in the catalog (rejects disabled/out-of-stock/bad-size), applies coupon rules and free-shipping threshold, throws `PricingError` with a customer-facing message. `createOrder` then decrements `stock_quantity` in the same transaction and throws `OutOfStockError` on a race.
- `site-chrome.ts` — header nav, footer nav, social, appearance, SEO, policy links, all with seed-matching defaults and `cache()`-memoised. `Header`/`Footer`/`WhatsAppButton`/`AnnouncementBar` are async server components that call these; `header-client.tsx` is the interactive part.
- `admin/users.ts` + `admin/password.ts` — `admin_users` table, PBKDF2-SHA256 via Web Crypto, `authenticateAdmin()` bootstraps the first account from `ADMIN_PASSWORD`. `admin/session.ts` signs the cookie with Web Crypto HMAC (no `node:crypto` anywhere in the app).
- `lib/catalog.ts`, `lib/categories.ts`, `lib/gamcha.ts`, `lib/product-filters.ts` — pure helpers safe for client components.

### API conventions

- Bodies are validated with zod: `lib/orders/schemas.ts` (public) and `lib/cms/schemas.ts` (admin). Use `parseJsonBody(request, schema)` from `lib/api/validation.ts`; it returns a ready 400 on failure.
- Wrap admin handlers in `withErrorHandling(...)` so SQLite constraint errors become 409/500 JSON instead of crashes. Route files can only export HTTP methods, so `export const GET = withErrorHandling(async (...) => ...)`.
- `lib/api/rate-limit.ts` uses the Workers rate-limit bindings (`LOGIN_LIMITER` 5/min, `ORDER_LIMITER` 10/min, `QUOTE_LIMITER` 60/min, declared under `unsafe.bindings`) keyed by `cf-connecting-ip`, with a D1 `rate_limits` table fallback when a binding is missing.
- `POST /api/orders/quote` is public and returns the same numbers `POST /api/orders` will charge; the checkout page calls it on mount and on coupon apply.

### Rendering model

The root layout is `force-dynamic`, so nothing is prerendered and `next build` never needs a database (no `generateStaticParams` anywhere). Admin write routes call `revalidateStorefront()` (`cms/revalidate.ts`) after every mutation — add new storefront paths there if you create pages. The homepage renders sections in the order/enabled state stored in `homepage_sections`, mapping `section.type` → component in `app/page.tsx`. The section catalogue lives in `cms/content-schemas.ts#HOMEPAGE_SECTION_CATALOGUE` (`hero`, `trust`, `collections`, `categories`, `new_arrivals`, `bestsellers`, `featured`, `story`, `how_we_work`, `lookbook`, `testimonials`); `mergeHomepageSections()` inserts any type a stored list doesn't know yet at its catalogue position, so adding a section = add to the enum + catalogue + `sectionMap` in `page.tsx`, no data migration.

Root `layout.tsx` builds metadata from the `seo` blob with a `%s | <siteTitle>` template — page titles must **not** append the brand themselves. `app/robots.ts`, `app/sitemap.ts`, `app/not-found.tsx`, `app/error.tsx` and `/policies` exist. Do not add a root `loading.tsx`: its Suspense boundary streams a 200 before `notFound()` can set a 404, and page data is fetched before render so there is little to show while waiting.

### Admin CMS

- `/admin/login` → `POST /api/admin/login` (username + password) verifies against `admin_users`, sets an HMAC-signed 7-day cookie carrying `{userId, username}`. `POST /api/admin/password` changes the password (form on `/admin/settings`).
- `src/app/admin/(protected)/layout.tsx` redirects unauthenticated users; every `/api/admin/*` handler and `GET /api/orders` independently check `isAdminAuthenticated()`.
- Admin pages are thin server shells (`AdminNav` + one client component). Editors live in `components/admin/editors/` and are built from the form kit in `components/admin/form/` (`fields.tsx`, `ImageField`, `GalleryField`, `LinkField`, `MediaLibrary`, `sortable.tsx` on dnd-kit). A content blob editor = `useContent(key, schema, defaults)` + `BlobEditor` + fields; lists use `Repeater` (add `_id` for drag keys, strip with `withoutId` before saving).
- Media: `/admin/media` and the pickers use `GET/POST/DELETE /api/admin/media` (R2 list/upload/delete-if-unreferenced). `form/upload.ts` downsizes photos to 1600 px WebP client-side before upload — keep that path for any new image input.
- `GET /api/admin/links` feeds `LinkField` (pages, categories, products) for any CTA/nav URL input.
- Image uploads (`POST /api/admin/media`) sniff magic bytes (JPEG/PNG/WebP/AVIF/GIF only, ≤ 8 MB) and `put` to R2 under `<uuid>.<ext>`; `app/uploads/cms/[key]/route.ts` serves them back at the same `/uploads/cms/<key>` URLs with immutable cache headers. `cms/media.ts#deleteOrphanedUploads` removes objects nothing references when a product is deleted.

### Checkout / order flow

Cart is client-only React context persisted to `localStorage` (`lib/cart.tsx`, key `womania-cart-v1`); the price it stores is display-only. `checkout-content.tsx` sends `{productId, slug, size, quantity}` lines + optional `couponCode` + a client-generated `idempotencyKey` to `POST /api/orders`. The route re-prices everything via `quoteOrder`, forces `paymentStatus: "COD"`, creates the order (decrementing stock), then fires three notifications in sequence — owner WhatsApp, customer WhatsApp, owner email — recording success/error per channel on the order row so retries (same idempotency key) skip channels that already succeeded. WhatsApp tries Meta Cloud API first, then CallMeBot. Message bodies come from the `whatsapp_template` / `customer_whatsapp_template` site-content keys (`{{placeholder}}` syntax, rendered in `orders/message.ts`).

### Styling

Tailwind v4 with the theme declared in `src/app/globals.css` (`@theme inline`). Brand tokens: `ivory`, `maroon`, `maroon-dark`, `gold`, `gold-light`, `forest`, `charcoal`, `warm-gray`; fonts `font-serif` (Playfair Display) and `font-sans` (DM Sans) via `next/font`. Product images live under `public/products/<slug>/` (served as Workers static assets) and are `unoptimized` (no image resizing on the free plan — pre-size assets). Remote images are only allowed from `womaniabydola.com/wp-content/uploads/**`.
