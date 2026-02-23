import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Railway/Docker deployment
  // Produces a self-contained build that doesn't need node_modules
  output: "standalone",

  serverExternalPackages: ["@prisma/client"],

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression (gzip) handled by Railway/reverse proxy, so skip double-compression
  compress: true,

  // Production source maps off for smaller builds
  productionBrowserSourceMaps: false,

  // Security headers
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
    {
      // Cache static assets aggressively
      source: "/(.*)\\.(png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
