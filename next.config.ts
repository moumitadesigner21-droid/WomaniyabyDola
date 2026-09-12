import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
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
