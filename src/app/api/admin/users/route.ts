import { NextRequest, NextResponse } from "next/server";
import { getSession, createUser, getAllUsers, toggleUserActive, resetUserPassword, deleteUser } from "@/lib/auth";

// GET — list all users (admin only)
export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const allUsers = await getAllUsers();
  return NextResponse.json(allUsers);
}

// POST — create user (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, name, password, role } = await req.json();
  if (!email || !name || !password) {
    return NextResponse.json({ error: "請填寫所有欄位" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "密碼至少 6 個字" }, { status: 400 });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ error: "Email 格式不正確" }, { status: 400 });
  }

  try {
    const user = await createUser(email, name, password, role || "user");
    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError?.code === "23505") {
      return NextResponse.json({ error: "此 email 已被使用" }, { status: 409 });
    }
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}

// PATCH — toggle active / reset password / delete
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, action, value } = await req.json();

  if (action === "toggleActive") {
    await toggleUserActive(userId, value);
    return NextResponse.json({ success: true });
  }

  if (action === "resetPassword") {
    await resetUserPassword(userId, value);
    return NextResponse.json({ success: true });
  }

  if (action === "delete") {
    await deleteUser(userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
