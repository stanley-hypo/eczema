import { NextRequest, NextResponse } from "next/server";
import { authenticate, SESSION_COOKIE, SESSION_DURATION_DAYS } from "@/lib/auth";

// Simple in-memory rate limiter (resets on serverless cold start, but good enough)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "請輸入 email 和密碼" }, { status: 400 });
    }

    // Rate limiting
    const key = email.toLowerCase().trim();
    const now = Date.now();
    const attempts = loginAttempts.get(key);
    if (attempts && attempts.count >= MAX_ATTEMPTS && now - attempts.lastAttempt < WINDOW_MS) {
      return NextResponse.json({ error: "嘗試次數過多，請 15 分鐘後再試" }, { status: 429 });
    }

    const result = await authenticate(key, password);
    if (!result) {
      // Track failed attempt
      const current = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
      loginAttempts.set(key, { count: current.count + 1, lastAttempt: now });
      return NextResponse.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }

    // Clear failed attempts on success
    loginAttempts.delete(key);

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    response.cookies.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[API] Login error:", error);
    return NextResponse.json({ error: "登入失敗" }, { status: 500 });
  }
}
