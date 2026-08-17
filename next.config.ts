import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Required because this app has multiple root layouts (app/[locale] and app/admin,
  // no shared app/layout.tsx) — see app/global-not-found.tsx.
  experimental: {
    globalNotFound: true,
  },
  images: {
    // AVIF/WebP first for the low-bandwidth §3.1 budget; falls back automatically per browser support.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 24h — vehicle photos change rarely once published
    remotePatterns: [
      {
        // All admin-uploaded media (spec §4 storage requirement, fulfilled via Cloudinary).
        protocol: "https" as const,
        hostname: "res.cloudinary.com",
      },
      {
        // Seed data placeholder imagery only — replace models with real photography
        // before go-live (see README "Before go-live").
        protocol: "https" as const,
        hostname: "placehold.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.cloudinary.com https://www.google-analytics.com http://127.0.0.1:55321 ws://127.0.0.1:55321",
              "frame-src 'self' https://www.google.com https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
