import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rmb_access";

function isProtectedPath(pathname) {
  if (pathname.startsWith("/api/auth")) return false;
  if (pathname.startsWith("/api/access")) return false;
  if (pathname.startsWith("/access")) return false;
  return true;
}

export function proxy(request) {
  if (process.env.PLAYWRIGHT === "true") {
    return NextResponse.next();
  }
  if (process.env.VERCEL_ENV === "preview") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/access")) return NextResponse.next();
  if (pathname.startsWith("/api/access")) return NextResponse.next();

  const needsGate = isProtectedPath(pathname);
  if (!needsGate) return NextResponse.next();

  const sessionCookie =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;
  if (sessionCookie) {
    return NextResponse.next();
  }

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
