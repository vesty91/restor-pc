import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Next.js / React : inline styles + scripts nécessaires au runtime
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://api.resend.com",
      "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://maps.google.com https://www.google.com",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["ssh2"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/conseils/depannage-informatique-domicile-paris",
        destination: "/conseils/depannage-informatique-domicile-yerres",
        permanent: true,
      },
      {
        source: "/services/assistance-distance",
        destination: "/services/depannage-informatique",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
