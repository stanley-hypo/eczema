import { NextResponse } from "next/server";
import { logout, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
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
