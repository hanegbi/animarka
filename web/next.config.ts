import type { NextConfig } from "next";

// Where the FastAPI service listens. The browser only ever calls /api/v1 on this site.
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // In docker compose the render worker opens the dev server as "web". Dev only; production ignores it.
  allowedDevOrigins: ["web"],
  // The dev badge sits over the page corner in design screenshots.
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_ORIGIN}/api/v1/:path*` }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
