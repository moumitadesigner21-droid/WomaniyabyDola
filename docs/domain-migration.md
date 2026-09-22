# womaniabydola.com migration

## Current status — completed 19 September 2026, 15:23 UTC

Final propagation checks passed: an unpinned HTTPS request to www returned 308 to https://womaniabydola.com/shop?check=propagation, preserving path and query. A fresh in-app browser tab on the apex visibly rendered the new storefront (Heritage Modern / Your roots. Your rhythm., new category navigation and Cashfree card-payment messaging), not WordPress. The migration monitor is being stopped. The later recovery-fix deployment is version `6152a9cb-e9e7-4e47-b1fa-32d0643b6180`. A real paid transaction remains owner-operated and unverified.

Owner approved replacing the three web records. Removed only apex A/AAAA and www CNAME through Cloudflare; FTP remains DNS-only at 86.38.243.3. Original values below can be recreated for rollback; Hostinger hosting and domain registration were not changed.

Successfully deployed version `3f6ae275-bd2f-4378-9f51-21f66988f26f` with apex and www custom domains, workers.dev retained, and SITE_URL=https://womaniabydola.com. HTTPS GETs on apex home/shop/product/checkout/sitemap passed; admin redirects unauthenticated requests to login. Sitemap and robots use the new origin. Legacy /product redirects to /products. www returns 308 preserving path/query when pinned to the new authoritative Cloudflare address, with normal TLS validation enabled.

Synthetic signed Cashfree diagnostic callbacks return 200 on new and old origins; forged callbacks return 400. No order or charge was created. New payment return/notify URLs use SITE_URL.

All 307 migrated media files fetched from the canonical domain returned 200 and byte-for-byte matched local copies after cutover.

At the initial 14:43 check, DNS and browser caches still showed Hostinger. This was resolved in the final checks above. Entries below describe historical steps, not current blockers.

## Before cutover — 19 September 2026

Registrar and DNS: Hostinger. Nameservers `ns1.dns-parking.com`, `ns2.dns-parking.com`.
Hostinger DNS inventory (verified in dashboard):

| Type | Name | Value | TTL |
|---|---|---|---|
| A | @ | 86.38.243.3 | 1800 |
| AAAA | @ | 2a02:4780:11:1432:0:2342:6090:2 | 1800 |
| A | ftp | 86.38.243.3 | 1800 |
| CNAME | www | womaniabydola.com | 300 |

No MX, TXT, or DS records returned by public DNS checks; dashboard shows these four records only. Preserve FTP as DNS-only. Do not delete the Hostinger site, its files, or historical orders. Domain registration remains at Hostinger.

## Target

### Latest check — 19 September 2026, 14:37 UTC

Cloudflare API confirms zone `08b268ee3e08e32de8a5abe6bf5ef4d3` is **active**. Attaching Worker custom domains failed with code 100117: apex has externally managed DNS records; the existing apex A/AAAA and www CNAME must be removed first. The four original records remain unchanged, confirmed in the DNS dashboard. Wrangler OAuth lacks DNS edit access. Browser deletion requires action-time confirmation, so await owner approval to remove exactly those three web records and immediately attach apex/www to the Worker. Preserve ftp, domain registration and Hostinger hosting. The attempted deployment updated SITE_URL before route attachment failed; restore the workers.dev configuration while awaiting approval. Do not retry cutover automatically before approval.

Cloudflare authoritative DNS, with apex and www routed to Worker `womania-by-dola`. Canonical URL: `https://womaniabydola.com`; www redirects to apex preserving path/query. Production D1 and R2 bindings stay unchanged. Cashfree return and notify URLs follow SITE_URL. Preserve the workers.dev webhook endpoint for in-flight provider callbacks.

## Verification and rollback

Verify nameserver delegation, HTTPS certificate, apex/home/shop/product/checkout/admin, static assets, sitemap origin, www redirect, and signed Cashfree webhook reachability. No live card debit without the owner performing the payment.

To roll back traffic, restore the Hostinger nameservers above, or restore the original apex A/AAAA and www CNAME in Cloudflare after detaching the Worker custom domains. DNS caches can delay either cutover or rollback. Keep Hostinger hosting active through the verification period.

Cloudflare assigned `alex.ns.cloudflare.com` and `dayana.ns.cloudflare.com`. Imported records initially remain DNS-only, matching the old provider, until the Worker domains are attached. The user saved the nameserver change in Hostinger on 19 September 2026; both Hostinger's overview and the authoritative .com registry now confirm the Cloudflare nameservers.

Media preflight found 296 distinct WordPress media URLs in the production catalog/CMS and 309 including source/seed fallbacks. 307 files were copied to `public/wp-content/uploads` preserving their original URLs. Two URLs already returned 404 at Hostinger: the gamcha-peplum gallery image `2026/03/92d52547-e267-4fe8-9c23-4cf24fc69a42.jpeg` (active reference), and `2026/05/IMG_7169.jpg` (source fallback only). These are pre-existing missing images, not failed downloads due to migration.

Media and hostname/legacy product redirects deployed to Worker version `a46681b8-f8a7-4e91-aedb-df41fd56579b`. SITE_URL remains the workers.dev origin until the custom domain is active. Cloudflare still reports "Waiting for your registrar to propagate your new nameservers" after requesting a fresh nameserver check. Resolver 1.1.1.1 still returns the cached Hostinger delegation. Cloudflare's assigned authoritative server already serves the imported Hostinger A record, preserving the existing site while activation is pending.

Verification: all 307 copied media URLs fetched from the deployed Worker returned HTTP 200 and byte-for-byte matched their local files. Lint, payment regression tests, and OpenNext build passed. DNS delegation has changed, but the storefront cutover is not complete. Once Cloudflare activates the zone, attach apex and www Worker custom domains (replace only the corresponding old web records, preserve FTP), update SITE_URL, deploy, and verify HTTPS, redirects, assets, metadata and Cashfree callbacks. Do not claim production checkout on the custom domain is validated yet.
