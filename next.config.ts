import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
];

// HSTS est géré uniquement par le reverse proxy Synology (TLS termination).
// Ne pas le redéfinir ici : doublon public avec max-age différents (63072000 vs 15768000).
const productionOnlyHeaders = [
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
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://www.googletagmanager.com",
      // GA4 : *.host ne couvre PAS l’apex (ex. analytics.google.com). Inclure apex + www explicites.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://api.resend.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com",
      "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://maps.google.com https://www.google.com",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Reporting-Endpoints",
    value: 'csp-endpoint="/api/csp-report"',
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "script-src-attr 'none'",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com",
      "frame-src https://maps.google.com https://www.google.com",
      "worker-src 'self'",
      "upgrade-insecure-requests",
      "report-to csp-endpoint",
      "report-uri /api/csp-report",
    ].join("; "),
  },
];

const securityHeaders = isDev
  ? baseSecurityHeaders
  : [...baseSecurityHeaders, ...productionOnlyHeaders];

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
