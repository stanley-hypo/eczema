import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

// POST /api/setup — create initial admin (only if no users exist)
export async function POST() {
  const existing = await db.select().from(users);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Setup already completed" }, { status: 400 });
  }

  const admin = await db.insert(users).values({
    email: "admin@eczema.app",
    name: "Admin",
    passwordHash: await hashPassword("admin123"),
    role: "admin",
  }).returning({ id: users.id, email: users.email, name: users.name, role: users.role });

  return NextResponse.json({
    success: true,
    message: "Admin account created",
    credentials: {
      email: "admin@eczema.app",
      password: "admin123",
    },
    user: admin[0],
  });
}
