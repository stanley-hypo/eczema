import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Generate a CSRF token and set it as a double-submit cookie
export async function GET() {
  const csrfToken = crypto.randomUUID();
  
  const response = NextResponse.json({ csrfToken });
  response.cookies.set("csrf_token", csrfToken, {
    httpOnly: false, // Must be readable by JS to send in header
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  return response;
}
