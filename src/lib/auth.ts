import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE = "eczema_session";
const SESSION_DURATION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(email: string, name: string, password: string, role: "admin" | "user" = "user") {
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ email, name, passwordHash, role }).returning({ id: users.id, email: users.email, name: users.name, role: users.role });
  return user;
}

export async function authenticate(email: string, password: string) {
  const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isActive, true)));
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  // Update last login
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  // Create session
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ userId: user.id, token, expiresAt });

  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));

  if (!session) return null;

  const [user] = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, isActive: users.isActive }).from(users).where(eq(users.id, session.userId));

  if (!user || !user.isActive) return null;

  return { user, session };
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function getAllUsers() {
  return db.select({ id: users.id, email: users.email, name: users.name, role: users.role, isActive: users.isActive, createdAt: users.createdAt, lastLoginAt: users.lastLoginAt }).from(users);
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function deleteUser(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

export { SESSION_COOKIE, SESSION_DURATION_DAYS };
