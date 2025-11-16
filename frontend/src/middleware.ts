import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value || "";
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/confirmar") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|utn.svg|favicon.ico|api).*)"],
};
