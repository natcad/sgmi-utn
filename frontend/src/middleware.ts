import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  console.log("soy middleware")
  const token = req.cookies.get("refreshToken")?.value || "";
    console.log(token);
    console.log("TOKEN:", token ? "✅ existe" : "❌ vacío");

  const { pathname } = req.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!token && !isAuthRoute) {
    console.log("esta ruta es protegida");
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/grupos", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|utn.svg|login|register|forgot-password|reset-password).*)",
  ],
};
