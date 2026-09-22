# Cashfree validation — 19 September 2026

## Recovery fixes deployed

Production migration `0008_payment_recovery.sql` applied successfully; remote migration list confirms none pending. Worker version `6152a9cb-e9e7-4e47-b1fa-32d0643b6180` deployed with checkout recovery, edited-detail validation, scheduled reconciliation backoff, durable notification retries, and the admin retry action. Refund handling unchanged.

Eight regression tests, lint, typecheck and OpenNext build passed before deployment. Post-deployment HTTPS smoke checks: home and checkout 200; recovery lookup for an unknown reference 200 with `returnUrl: null` and `Cache-Control: no-store`; unauthenticated notification retry and reconciliation 401; www redirect 308 preserves path/query. Production five-minute cron remains attached. No live order, message resend or card charge was initiated during deployment validation.

## Completed

- Isolated sandbox Worker and D1 database; no production customer records copied.
- Card-only hosted checkout with Cashfree's provided Visa debit test card.
- Simulated insufficient-funds failure, then successful retry of the **same** order: `WD-20260919-0001`, ₹2,100. No actual debit.
- Rendered confirmation page, persisted paid status, both failed/successful attempts recorded.
- Genuine signed Cashfree success webhooks recorded in `cashfree_webhook_receipts`. Duplicate deliveries did not double-deduct inventory.
- Synthetic signed late-failure regression left that order paid; forged signature rejected; unauthenticated status access rejected.
- Second sandbox order `WD-20260919-cf4bbb283b5849d39235`: duplicate creation returned the same session/order; provider-confirmed termination restored stock once despite repeated reconciliation.
- Five automated regression tests, lint, typecheck, OpenNext build, and public-asset secret scan passed.
- Production database backed up before additive migrations 0005–0007.
- Production Worker deployed with live credentials, `CASHFREE_ENV=production`, API version `2025-01-01`.
- Production credentials authenticated; Cashfree dashboard's production webhook diagnostic succeeded. This is **not** proof of a live paid transaction.
- Production webhook narrowed to success/failed/user-dropped payment events. Existing webhook schema 2022-09-01 retained because it is immutable in the edit dialog; signature diagnostic passed. Sandbox endpoint uses 2025-01-01. API version and webhook schema version are independent.
- Five-minute production reconciliation cron deployed. Sandbox uses manual/checkout reconciliation to stay within the account's existing cron quota; no other project's schedules changed.
- Local app runs at `http://localhost:3001` using `.dev.vars.sandbox`. Secrets remain ignored by Git.

## Launch boundary

Cashfree's production whitelisting page lists **womaniabydola.com — Approved**. On 19 September 2026 the approved domain and www were attached to the production Worker, with SITE_URL updated to https://womaniabydola.com. HTTPS and checkout/return endpoint checks passed. Synthetic signed diagnostic callbacks return 200 on both the new domain and preserved workers.dev endpoint; forged signatures return 400. These diagnostics intentionally use an ignored event and do not mutate orders. New order return/notify URLs follow SITE_URL; the existing dashboard workers.dev webhook remains valid for in-flight callbacks. Some DNS caches still serve Hostinger immediately after cutover. The owner must still make one controlled real-card purchase and verify order/payment/settlement after propagation. No real card charge or refund was performed in this implementation.

Owner/customer notification delivery requires the separate WhatsApp/email credentials; sandbox sends none. Refund initiation and automated refund reconciliation are outside this card-checkout implementation. Process refunds in Cashfree and reconcile operationally; the admin cannot manually fabricate a provider-verified online payment state.
