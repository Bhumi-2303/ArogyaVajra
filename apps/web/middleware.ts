import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/features",
  "/how-it-works",
  "/about",
  "/privacy",
  "/terms",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets, internal Next.js paths, and static extensions pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Normalize trailing slash
  const normalizedPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  // Public routes remain publicly accessible
  if (PUBLIC_EXACT_PATHS.has(normalizedPath)) {
    return NextResponse.next();
  }

  // Lightweight session cookie check for dashboard / protected routes
  // UX check only; backend remains the sole authority for data and authorization
  const sessionCookie =
    request.cookies.get("arogyavajra_session")?.value ||
    request.cookies.get("session")?.value ||
    request.cookies.get("refresh_token")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};
