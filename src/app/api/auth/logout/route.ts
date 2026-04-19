import { NextRequest, NextResponse } from "next/server";
import { logout, SESSION_COOKIE } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  // CSRF check (but don't block logout if token missing — best effort)
  await verifyCsrf(req).catch(() => {});
  await logout();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
