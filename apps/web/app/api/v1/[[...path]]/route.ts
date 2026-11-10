import { NextRequest, NextResponse } from "next/server";
import { normalizeApiInternalUrl } from "@/lib/api/client";

export const dynamic = "force-dynamic";

/**
 * Same-Origin Runtime API Proxy Route Handler
 *
 * Proxies /api/v1/* requests from the web client directly to the backend API at runtime.
 * Guarantees:
 * 1. Reads process.env.API_INTERNAL_URL dynamically at request time (not baked into next build).
 * 2. In production, strictly validates that API_INTERNAL_URL is provided and does not point to localhost.
 * 3. Preserves HTTP method, query parameters, request headers, and streamed body.
 * 4. Injects / forwards X-Forwarded-For, X-Forwarded-Proto, and X-Forwarded-Host headers.
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
      headers.set(key, value);
    });

    // Forward or set X-Forwarded-For
    const existingXff = request.headers.get("x-forwarded-for");
    const clientIp = request.ip;
    if (existingXff) {
      headers.set("x-forwarded-for", existingXff);
    } else if (clientIp) {
      headers.set("x-forwarded-for", clientIp);
    }

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
    const message = error instanceof Error ? error.message : "Internal proxy error";
    const status =
      message.includes("ConfigurationError") || message.includes("Security validation failed")
        ? 500
        : 502;

    console.error(`[API Proxy Error] ${request.method} ${request.nextUrl.pathname}:`, error);

    return NextResponse.json(
      {
        detail: "API Proxy Gateway Error",
        error: message,
      },
      { status }
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
