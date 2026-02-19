import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Session-refresh middleware for Supabase Auth.
 *
 * NOTE: Next.js 16 deprecates the "middleware" file convention in favour of
 * the new "proxy" API. We cannot migrate yet because @supabase/ssr relies on
 * the middleware cookie helpers. Revisit once Supabase releases proxy-compatible
 * auth helpers.  See https://nextjs.org/docs/messages/middleware-to-proxy
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
