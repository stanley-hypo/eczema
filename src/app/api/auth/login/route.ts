import { NextRequest, NextResponse } from "next/server";
import { authenticate, SESSION_COOKIE, SESSION_DURATION_DAYS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "請輸入 email 和密碼" }, { status: 400 });
    }

    const result = await authenticate(email, password);
    if (!result) {
      return NextResponse.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }

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
