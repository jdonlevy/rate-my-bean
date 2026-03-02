import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rmb_access";

export async function POST(request) {
  const { code, next } = await request.json();
  const expected = process.env.ACCESS_CODE;

  if (!expected || code !== expected) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const response = NextResponse.json({ redirect: next || "/" });
  response.cookies.set(ACCESS_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
