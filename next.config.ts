import type { NextConfig } from "next";

/**
 * API proxy: the browser only ever talks to same-origin /api/* paths.
 * Express-owned prefixes are rewritten to the backend origin; Better Auth
 * (/api/auth/*) and the JWT exchange (/api/session) stay on Next.js, so
 * there is no proxy loop.
 */
const apiOrigin =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

const nextConfig: NextConfig = {
  // Auth pages and dashboards are dynamic; keep caching conservative.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/api/studios/:path*", destination: `${apiOrigin}/api/studios/:path*` },
      { source: "/api/bookings/:path*", destination: `${apiOrigin}/api/bookings/:path*` },
      { source: "/api/my-listings", destination: `${apiOrigin}/api/my-listings` },
      { source: "/api/my-bookings", destination: `${apiOrigin}/api/my-bookings` },
      { source: "/api/host/bookings/:path*", destination: `${apiOrigin}/api/host/bookings/:path*` },
      { source: "/api/wishlist/:path*", destination: `${apiOrigin}/api/wishlist/:path*` },
      { source: "/api/users/:path*", destination: `${apiOrigin}/api/users/:path*` },
      { source: "/api/upload", destination: `${apiOrigin}/api/upload` },
      { source: "/api/newsletter", destination: `${apiOrigin}/api/newsletter` },
      { source: "/api/health", destination: `${apiOrigin}/api/health` },
    ];
  },
};

export default nextConfig;
