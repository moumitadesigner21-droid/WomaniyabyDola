import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Gives `next dev` access to the Cloudflare bindings declared in wrangler.jsonc
// (local D1/R2 under .wrangler/state) via getCloudflareContext().
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    // Cloudflare's image resizing is not on the free plan; assets in public/
    // are pre-sized and served as-is.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "womaniabydola.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.womaniabydola.com" }],
        destination: "https://womaniabydola.com/:path*",
        permanent: true,
      },
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
      {
        source: "/products/multicoloured-cotton-gamcha-dupatta",
        destination: "/products/multicoloured-patchwork-gamcha-dupatta",
        permanent: true,
      },
      {
        source: "/shop",
        has: [{ type: "query", key: "gamcha", value: "1" }],
        destination: "/category/gamcha",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
