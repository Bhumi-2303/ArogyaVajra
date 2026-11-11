/**
 * Centralized API client with automatic token attachment and 401 recovery.
 * Access token is stored strictly in-memory (never in localStorage).
 * Refresh token is handled securely via httpOnly, Secure, SameSite=Lax cookies.
 */

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// In-memory access token storage
let memoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  memoryAccessToken = token;
}

/**
 * Manage lightweight session indicator cookie for frontend navigation and Next.js middleware.
 * The backend remains the sole authoritative source of truth for authorization.
 */
export function setSessionCookie(): void {
  if (typeof document !== "undefined") {
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `arogyavajra_session=1; path=/; SameSite=Lax${isHttps ? "; Secure" : ""}; max-age=${7 * 86400}`;
  }
}

export function clearSessionCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie = "arogyavajra_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

// Backwards-compatible aliases that operate strictly on in-memory storage and session cookies
export function getStoredAccessToken(): string | null {
  return memoryAccessToken;
}

export function getStoredRefreshToken(): string | null {
  return null;
}

export function setStoredTokens(accessToken: string, _refreshToken?: string): void {
  setAccessToken(accessToken);
  setSessionCookie();
}

export function clearStoredTokens(): void {
  setAccessToken(null);
  clearSessionCookie();
}

/**
 * Validate that an IP string is a syntactically valid IPv4 or IPv6 address.
 */
export function isValidIpAddress(ip?: string | null): boolean {
  if (!ip) return false;
  const clean = ip.trim();
  // IPv4 check: 4 octets between 0 and 255
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(clean)) {
    return true;
  }
  // IPv6 check
  try {
    const unbracketed = clean.replace(/^\[|\]$/g, "");
    if (unbracketed.includes(":") && unbracketed.split(":").length <= 8) {
      new URL(`http://[${unbracketed}]`);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export interface ClientIpResolvableRequest {
  headers: {
    get(name: string): string | null;
  };
  ip?: string;
}

/**
 * Resolve trustworthy client IP from Cloudflare/Render edge platform headers.
 * - When TRUST_PLATFORM_IP_HEADERS is true (e.g. Render production behind Cloudflare):
 *   uses CF-Connecting-IP or True-Client-IP set by Cloudflare edge.
 * - When TRUST_PLATFORM_IP_HEADERS is false (default): ignores edge platform headers.
 * - In local development: falls back to the leftmost valid X-Forwarded-For entry.
 * - Never returns or trusts client-chosen spoofed headers.
 */
export function resolveTrustworthyClientIp(
  request: ClientIpResolvableRequest,
  isProdOverride?: boolean,
  trustPlatformHeadersOverride?: boolean
): string {
  const isProd =
    isProdOverride !== undefined ? isProdOverride : process.env.NODE_ENV === "production";
  const trustPlatformHeaders =
    trustPlatformHeadersOverride !== undefined
      ? trustPlatformHeadersOverride
      : process.env.TRUST_PLATFORM_IP_HEADERS === "true";

  // 1. Non-spoofable platform edge headers (Cloudflare / Render proxy edge)
  // Only trusted when TRUST_PLATFORM_IP_HEADERS is explicitly enabled (e.g. on Render)
  if (trustPlatformHeaders) {
    const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
    if (cfConnectingIp && isValidIpAddress(cfConnectingIp)) {
      return cfConnectingIp;
    }

    const trueClientIp = request.headers.get("true-client-ip")?.trim();
    if (trueClientIp && isValidIpAddress(trueClientIp)) {
      return trueClientIp;
    }
  }

  // 2. In local development only, fall back to leftmost valid X-Forwarded-For entry
  if (!isProd) {
    const rawXff = request.headers.get("x-forwarded-for");
    if (rawXff) {
      const parts = rawXff.split(",").map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (isValidIpAddress(part)) {
          return part;
        }
      }
    }
  }

  // 3. Fallback to runtime request.ip or standard local loopback
  if (request.ip && isValidIpAddress(request.ip)) {
    return request.ip;
  }

  return isProd ? "unknown" : "127.0.0.1";
}

/**
 * Normalize API_INTERNAL_URL for server-side runtime proxying.
 * - Trims whitespace and trailing slashes.
 * - In production, throws loudly if API_INTERNAL_URL is unset/empty or points to localhost.
 * - In development, defaults to "http://localhost:8000" if unset.
 * - Prefixes "http://" for private-network host:port values (e.g. Render fromService hostport: "arogyavajra-api:8000").
 * - Leaves full URLs (e.g. "https://api.example.com", "http://internal:8000") alone.
 */
export function normalizeApiInternalUrl(
  rawUrl?: string,
  isProdOverride?: boolean
): string {
  const isProd =
    isProdOverride !== undefined ? isProdOverride : process.env.NODE_ENV === "production";
  const candidate = (rawUrl ?? process.env.API_INTERNAL_URL ?? "").trim().replace(/\/+$/, "");

  if (!candidate) {
    if (isProd) {
      throw new Error(
        "ConfigurationError: API_INTERNAL_URL environment variable is required in production."
      );
    }
    return "http://localhost:8000";
  }

  const normalized =
    candidate.startsWith("http://") || candidate.startsWith("https://")
      ? candidate
      : `http://${candidate}`;

  if (isProd) {
    try {
      const parsed = new URL(normalized);
      if (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "0.0.0.0" ||
        parsed.hostname === "::1" ||
        parsed.hostname === "[::1]"
      ) {
        throw new Error(
          `Security validation failed: In production, API_INTERNAL_URL destination cannot point to localhost/loopback address '${candidate}'.`
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith("Security validation failed")) {
        throw err;
      }
      if (
        candidate.includes("localhost") ||
        candidate.includes("127.0.0.1") ||
        candidate.includes("0.0.0.0")
      ) {
        throw new Error(
          `Security validation failed: In production, API_INTERNAL_URL destination cannot point to localhost/loopback address '${candidate}'.`
        );
      }
    }
  }

  return normalized;
}

/**
 * Resolve endpoint to full or relative API URL ensuring /api/v1 is always present exactly once.
 * In production (when NEXT_PUBLIC_API_URL is unset), returns relative /api/v1 paths
 * so requests are same-origin and proxied via Next.js rewrites to prevent cross-site cookie drop.
 * In development, defaults to http://localhost:8000/api/v1.
 */
export function resolveApiUrl(endpoint: string, baseUrl?: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const defaultBase = isProd ? "/api/v1" : "http://localhost:8000/api/v1";
  const rawBase = baseUrl ?? (process.env.NEXT_PUBLIC_API_URL || defaultBase);
  const base = rawBase.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const baseHasVersion = base.endsWith("/api/v1");
  const endpointHasVersion =
    normalizedEndpoint === "/api/v1" ||
    normalizedEndpoint.startsWith("/api/v1/") ||
    normalizedEndpoint.startsWith("/api/v1?");

  if (normalizedEndpoint === "/") {
    return baseHasVersion ? base : (base ? `${base}/api/v1` : "/api/v1");
  }

  if (baseHasVersion && endpointHasVersion) {
    const stripped = normalizedEndpoint.slice("/api/v1".length);
    return `${base}${stripped}`;
  }

  if (!baseHasVersion && !endpointHasVersion) {
    return `${base}/api/v1${normalizedEndpoint}`;
  }

  return `${base}${normalizedEndpoint}`;
}

/**
 * Execute an authenticated API request with credentials and automatic 401 refresh recovery.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = resolveApiUrl(endpoint);
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with silent cookie-based token refresh attempt
  if (
    response.status === 401 &&
    !endpoint.includes("/auth/refresh") &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/register")
  ) {
    try {
      const refreshRes = await fetch(resolveApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newAccess = refreshData.data.access_token;
        setAccessToken(newAccess);
        setSessionCookie();

        // Retry original request with fresh token
        headers["Authorization"] = `Bearer ${newAccess}`;
        response = await fetch(url, {
          credentials: "include",
          ...options,
          headers,
        });
      } else {
        setAccessToken(null);
        clearSessionCookie();
      }
    } catch {
      setAccessToken(null);
      clearSessionCookie();
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    let errorData: unknown = null;
    try {
      errorData = await response.json();
      if (typeof errorData === "object" && errorData !== null) {
        if ("error" in errorData) {
          const errObj = (errorData as { error: unknown }).error;
          if (typeof errObj === "object" && errObj !== null && "message" in errObj) {
            errorMessage = String((errObj as { message: unknown }).message);
          }
        } else if ("detail" in errorData) {
          const detail = (errorData as { detail: unknown }).detail;
          if (typeof detail === "string") {
            errorMessage = detail;
          } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
            errorMessage = detail[0].msg;
          }
        } else if ("message" in errorData) {
          errorMessage = String((errorData as { message: unknown }).message);
        }
      }
    } catch {
      // Body not JSON
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json() as Promise<T>;
}
