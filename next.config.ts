import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Build the CSP connect-src directive with robust fallbacks.
 *
 * Env vars may be empty at build time (Vercel injects NEXT_PUBLIC_* at build,
 * but if misconfigured or missing they resolve to "").  We filter out blanks
 * and always include the production URLs as fallback so mobile browsers
 * (which enforce CSP more strictly than desktop) never block API calls.
 */
function buildConnectSrc(): string {
  const sources = new Set<string>(["'self'", "wss://*.supabase.co"]);

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();

  if (supabaseUrl) sources.add(supabaseUrl);
  if (apiUrl) sources.add(apiUrl);

  // Hardcoded production fallbacks — guarantees CSP is never broken
  // even if env vars are empty during Vercel build
  sources.add("https://iknuuplnizdlaidjpwdh.supabase.co");
  sources.add("https://api.cualesminombre.com");

  return `connect-src ${[...sources].join(" ")}`;
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      buildConnectSrc(),
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "sonner", "motion", "recharts"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withSentryConfig(analyzer(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  // Webpack-only options (ignored under Turbopack but silences deprecation warnings).
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: false,
  },
});
