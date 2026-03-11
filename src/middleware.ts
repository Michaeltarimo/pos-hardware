import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth page and Next internal/static assets
  if (
    pathname === "/auth" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("status", "loggedout");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};

