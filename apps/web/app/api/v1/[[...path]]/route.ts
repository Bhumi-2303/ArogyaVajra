import { NextRequest, NextResponse } from "next/server";
import {
  normalizeApiInternalUrl,
  resolveTrustworthyClientIp,
} from "@/lib/api/client";

export const dynamic = "force-dynamic";

/**
 * Same-Origin Runtime API Proxy Route Handler
 *
 * Proxies /api/v1/* requests from the web client directly to the backend API at runtime.
 * Guarantees:
 * 1. Reads process.env.API_INTERNAL_URL dynamically at request time (not baked into next build).
 * 2. In production, strictly validates that API_INTERNAL_URL is provided and does not point to localhost.
 * 3. Preserves HTTP method, query parameters, request headers, and streamed body.
 * 4. Strips ALL client-supplied forwarded headers and injects a single trustworthy X-Real-IP header.
 * 5. Passes through backend status codes and all Set-Cookie headers individually.
 */
async function handleProxy(
  request: NextRequest,
  context: { params: { path?: string[] } }
): Promise<NextResponse> {
  try {
    const internalUrl = normalizeApiInternalUrl();
    const cleanBase = internalUrl.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "");
    const subPath =
      context.params?.path && context.params.path.length > 0
        ? `/${context.params.path.join("/")}`
        : "";
    const search = request.nextUrl.search || "";
    const targetUrl = `${cleanBase}/api/v1${subPath}${search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Omit hop-by-hop headers handled at transport layer
      if (
        lower === "host" ||
        lower === "connection" ||
        lower === "content-length" ||
        lower === "keep-alive" ||
        lower === "transfer-encoding"
      ) {
        return;
      }

      // CRITICAL: Strip ALL client-supplied forwarded / IP headers and client auth-flow bypass headers
      // Never forward a client-chosen IP or client opt-in header to the backend API
      if (
        lower === "x-forwarded-for" ||
        lower === "x-real-ip" ||
        lower === "forwarded" ||
        lower === "true-client-ip" ||
        lower === "cf-connecting-ip" ||
        lower === "x-client-type" ||
        lower === "x-auth-flow"
      ) {
        return;
      }

      headers.set(key, value);
    });

    // Inject the single trusted client IP header from the platform header
    const trustworthyIp = resolveTrustworthyClientIp(request);
    headers.set("x-real-ip", trustworthyIp);

    // Forward or set X-Forwarded-Proto
    const existingProto = request.headers.get("x-forwarded-proto");
    if (existingProto) {
      headers.set("x-forwarded-proto", existingProto);
    } else {
      headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
    }

    // Forward or set X-Forwarded-Host
    const existingHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (existingHost) {
      headers.set("x-forwarded-host", existingHost);
    }

    const hasBody =
      request.method !== "GET" &&
      request.method !== "HEAD" &&
      request.body !== null;

    const fetchOptions: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "manual",
      ...(hasBody ? { duplex: "half" } : {}),
    };

    const backendResponse = await fetch(targetUrl, fetchOptions);

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower === "content-encoding" ||
        lower === "content-length" ||
        lower === "transfer-encoding" ||
        lower === "connection"
      ) {
        return;
      }
      if (lower !== "set-cookie") {
        responseHeaders.set(key, value);
      }
    });

    // Preserve multiple Set-Cookie headers individually
    const setCookies =
      typeof backendResponse.headers.getSetCookie === "function"
        ? backendResponse.headers.getSetCookie()
        : backendResponse.headers.get("set-cookie")
        ? [backendResponse.headers.get("set-cookie")!]
        : [];

    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", cookie);
    }

    const responseBody =
      backendResponse.status === 204 ||
      backendResponse.status === 205 ||
      backendResponse.status === 304
        ? null
        : backendResponse.body;

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error(`[API Proxy Error] ${request.method} ${request.nextUrl.pathname}:`, error);

    return NextResponse.json(
      { detail: "Bad gateway" },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { path?: string[] } }
) {
  return handleProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: { path?: string[] } }
) {
  return handleProxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path?: string[] } }
) {
  return handleProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path?: string[] } }
) {
  return handleProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path?: string[] } }
) {
  return handleProxy(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: { params: { path?: string[] } }
) {
  return handleProxy(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: { path?: string[] } }
) {
  return handleProxy(request, context);
}
