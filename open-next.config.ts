import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every route is force-dynamic and reads D1 per request, so no ISR/data cache
// backend is configured. Add an R2/KV incremental cache here if that changes.
export default defineCloudflareConfig();
