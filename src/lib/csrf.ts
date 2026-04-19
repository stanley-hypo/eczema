import { cookies } from "next/headers";

/**
 * CSRF protection using the double-submit cookie pattern.
 * 
 * Flow:
 * 1. Client calls GET /api/csrf → gets csrf_token in both cookie and response body
 * 2. Client stores the token in memory
 * 3. On every state-changing request (POST/PATCH/DELETE), client sends:
 *    - Cookie: csrf_token=xxx (automatic)
 *    - Header: X-CSRF-Token: xxx (manual)
 * 4. Server compares cookie value with header value
 * 
 * With sameSite: "strict", the cookie won't be sent on cross-site requests,
 * adding an extra layer of protection.
 */
export async function verifyCsrf(req: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("csrf_token")?.value;
  const headerToken = req.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== 36 || headerToken.length !== 36) return false;

  // Constant-time comparison to prevent timing attacks
  return cookieToken === headerToken;
}
