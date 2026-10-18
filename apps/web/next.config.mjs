/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

// Parse configured API origin safely
const apiOrigin = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const parsed = new URL(apiUrl);
    return parsed.origin;
  } catch {
    return null;
  }
})();

const connectSources = ["'self'"];
if (isProd) {
  // Production: Only allow self and explicitly configured secure HTTPS API origin
  if (apiOrigin && apiOrigin.startsWith("https://")) {
    connectSources.push(apiOrigin);
  }
} else {
  // Development: Permit local API development ports
  connectSources.push("http://localhost:8000", "http://127.0.0.1:8000");
  if (apiOrigin) {
    connectSources.push(apiOrigin);
  }
}

const scriptSources = ["'self'", "'unsafe-inline'"];
if (!isProd) {
  // Development: Next.js Fast Refresh requires unsafe-eval
  scriptSources.push("'unsafe-eval'");
}

const cspDirectives = [
  "default-src 'self'",
  `script-src ${scriptSources.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(" ")}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
];

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

// HSTS is only served in HTTPS production environments.
// Preload is disabled by default to avoid permanently bricking unverified subdomains
// unless explicitly confirmed and opted in via ENABLE_HSTS_PRELOAD=true.
if (isProd) {
  const hstsDirectives = ["max-age=31536000", "includeSubDomains"];
  if (process.env.ENABLE_HSTS_PRELOAD === "true") {
    hstsDirectives.push("preload");
  }
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: hstsDirectives.join("; "),
  });
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

