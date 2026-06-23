import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "./auth.config";

// Edge-safe auth — no bcrypt or Prisma imported here.
// Subscription enforcement is handled inside each protected API route.
const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/signin", "/signup", "/reset-password", "/pricing", "/api/auth"];

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (pathname === "/api/webhooks/stripe") {
    return NextResponse.next();
  }

  const session = (req as NextRequest & { auth?: { user?: { id?: string } } }).auth;
  if (!session?.user?.id) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
