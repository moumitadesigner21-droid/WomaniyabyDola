import app from "./.open-next/worker.js";
export * from "./.open-next/worker.js";

const worker = {
  fetch: app.fetch,
  async scheduled(_event, env, ctx) {
    const timestamp = String(Date.now());
    const body = "reconcile-expired-payments";
    if (!env.CASHFREE_CLIENT_SECRET) throw new Error("Payment reconciliation secret missing");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.CASHFREE_CLIENT_SECRET.trim()), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
    const signature = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + body)))));
    const response = await app.fetch(new Request(new URL("/api/payments/cashfree/reconcile", env.SITE_URL), {
      method:"POST", body,
      headers:{"x-webhook-timestamp":timestamp,"x-webhook-signature":signature},
    }), env, ctx);
    if (!response.ok) throw new Error(`Payment reconciliation returned ${response.status}`);
    console.log("Payment reconciliation", await response.text());
  },
};
export default worker;
