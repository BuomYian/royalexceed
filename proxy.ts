import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleIntl = createMiddleware(routing);

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (see
// node_modules/next/dist/docs/.../upgrading/version-16.md#middleware-to-proxy).
// The exported function must be named `proxy`.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/uploads")) {
    const { response, user } = await updateSession(request);

    const isLoginPage = pathname === "/admin/login";

    if (!user && pathname.startsWith("/admin") && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  // Public site: locale detection/redirects only. No auth needed here.
  return handleIntl(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml)$).*)",
  ],
};
