# Code Review — Eczema Tracker (2026-04-19)

## 🔴 Critical Issues (Must Fix)

### 1. `/api/setup` — Unauthenticated admin creation
**File**: `src/app/api/setup/route.ts`
**Risk**: Anyone can call `POST /api/setup` before the first admin is created. While it checks `existing.length > 0`, a race condition could allow multiple admins.
**Fix**: ✅ After first setup, the endpoint correctly blocks further calls. **But** — we should delete this endpoint after setup.

### 2. `/api/suggestions` — No auth guard
**File**: `src/app/api/suggestions/route.ts`
**Risk**: Anyone can read all medication names and food items from the database. Leaks user data.
**Fix**: Add `getSession()` check and scope to current user.

### 3. `/api/weather` — No input sanitization on lat/lon
**File**: `src/app/api/weather/route.ts`
**Risk**: `lat` and `lon` parameters are injected directly into the URL. SSRF potential.
**Fix**: Validate lat/lon are numeric.

### 4. Password minimum length not enforced server-side
**File**: `src/app/api/admin/users/route.ts`
**Risk**: Admin page has `minLength={6}` but the API route has NO password validation.
**Fix**: Add `password.length < 6` check in API.

### 5. `deleteUser` doesn't cascade delete user's daily_logs
**File**: `src/lib/auth.ts`
**Risk**: Deleting a user leaves orphan daily_logs, medications, etc. in the database.
**Fix**: Delete user's logs before deleting user.

### 6. Session cleanup — no expiry sweep
**File**: `src/lib/auth.ts`
**Risk**: Expired sessions accumulate forever in the `sessions` table.
**Fix**: Add periodic cleanup (or clean on every `getSession` call).

## 🟡 Warnings (Should Fix)

### 7. `error: any` in admin users route
**File**: `src/app/api/admin/users/route.ts:39`
```ts
} catch (error: any) {
```
**Fix**: Use `error instanceof Error` pattern.

### 8. Console.log statements in production
**Files**: Multiple API routes and LogForm.tsx have `console.log("[API]...")` debug statements.
**Fix**: Remove or gate behind `process.env.NODE_ENV === "development"`.

### 9. `useRouter` imported but not needed in LogForm
**File**: `src/components/LogForm.tsx`
`router.push` was replaced with `window.location.href` but `useRouter` is still imported and used for the back button. Not critical but the back button could also use `window.location`.

### 10. No CSRF protection on state-changing requests
**Risk**: Cookie-based auth without CSRF tokens. `sameSite: "lax"` helps but doesn't fully protect against all CSRF scenarios.
**Fix**: Consider adding CSRF token for non-GET requests.

### 11. Suggestions API reads ALL users' data
**File**: `src/app/api/suggestions/route.ts`
The suggestions endpoint reads medications and food entries from ALL users, not scoped to current user.
**Fix**: Join through daily_logs to filter by userId.

### 12. Admin PATCH endpoint is too permissive
**File**: `src/app/api/admin/users/route.ts`
A single PATCH endpoint handles toggleActive, resetPassword, and delete. No validation on `value` for resetPassword (could be empty string).
**Fix**: Split into separate endpoints or add validation per action.

### 13. Missing `user_id` index on `daily_logs`
**File**: `src/db/schema.ts`
Every API call filters by `userId` but there's no index on it.
**Fix**: Add index on `user_id` column.

## 🟢 Minor Suggestions

### 14. `bcrypt` rounds = 10 is fine for now but could be 12 for production
### 15. Session token uses `crypto.randomUUID()` — good entropy
### 16. Cookie settings are good: `httpOnly: true, secure: true, sameSite: "lax"`
### 17. The `nInt()` helper handles edge cases well (null, undefined, empty string, float)
### 18. AuthProvider + RequireAuth pattern is clean
### 19. Drizzle ORM prevents SQL injection by design
### 20. `fetchCache = "force-no-store"` is a good workaround for Vercel caching

## ✅ What's Done Well

- Clean separation of auth logic into `src/lib/auth.ts`
- User-scoped data isolation on all log endpoints
- Cookie-based session management with proper expiration
- Admin-only user management with no public registration
- Proper cascade deletes on log-related tables
- Type-safe Drizzle schema
- Good error handling on the save flow (after the float→int fix)
- Mobile-first responsive design
- Cantonese-localized UI
