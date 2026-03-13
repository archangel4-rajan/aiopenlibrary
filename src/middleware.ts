import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Session-refresh middleware for Supabase Auth.
 *
 * Also redirects authenticated users without a username to /welcome.
 *
 * NOTE: Next.js 16 deprecates the "middleware" file convention in favour of
 * the new "proxy" API. We cannot migrate yet because @supabase/ssr relies on
 * the middleware cookie helpers. Revisit once Supabase releases proxy-compatible
 * auth helpers.  See https://nextjs.org/docs/messages/middleware-to-proxy
 */
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Skip redirect logic for /welcome itself, API routes, and auth routes
  const { pathname } = request.nextUrl;
  if (
    pathname === "/welcome" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/"
  ) {
    return response;
  }

  // Check if user is logged in (has Supabase auth cookies) but no username cookie
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  const hasUsername = request.cookies.get("has_username")?.value === "1";

  if (hasAuthCookie && !hasUsername) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm)$).*)",
  ],
};
