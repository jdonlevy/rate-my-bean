import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rmb_access";

function isProtectedPath(pathname) {
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/beans/new")) return true;
  if (pathname.startsWith("/api/beans")) return true;
  if (pathname.startsWith("/api/ratings")) return false;
  return false;
}

function isProtectedWrite(pathname, method) {
  if (method === "GET") return false;
  if (pathname.startsWith("/api/beans")) return true;
  return false;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/access")) return NextResponse.next();
  if (pathname.startsWith("/api/access")) return NextResponse.next();

  const needsGate =
    isProtectedPath(pathname) || isProtectedWrite(pathname, request.method);
  if (!needsGate) return NextResponse.next();

  const accessCookie = request.cookies.get(ACCESS_COOKIE)?.value;
  if (accessCookie === "1") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
