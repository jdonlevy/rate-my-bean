import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rmb_access";

function isProtectedPath(pathname) {
  if (pathname.startsWith("/api/auth")) return false;
  if (pathname.startsWith("/api/access")) return false;
  if (process.env.NODE_ENV === "development") {
    if (pathname.startsWith("/api/roasteries/search")) return false;
    if (pathname.startsWith("/api/roasteries/import")) return false;
    if (pathname.startsWith("/api/roasteries/nominatim")) return false;
  }
  if (pathname.startsWith("/access")) return false;
  if (pathname.startsWith("/login")) return false;
  if (pathname.startsWith("/signup")) return false;
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
  if (pathname.startsWith("/login")) return NextResponse.next();
  if (pathname.startsWith("/signup")) return NextResponse.next();

  const needsGate = isProtectedPath(pathname);
  if (!needsGate) return NextResponse.next();

  // Access gate disabled.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
