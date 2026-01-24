# Server Actions API Guide

This document describes the server-side functions (Server Actions) that handle business logic and data mutations in VCC Verify.

## Overview

Server Actions are async functions marked with `"use server"` that run on the server. They're called from forms and client code, handling authentication, rate limiting, validation, and database operations.

**Pattern**:
```typescript
"use server";

export async function actionName(
  _prevState: StateType,
  formData: FormData
): Promise<StateType> {
  // Validate, rate limit, authorize
  // Execute mutation
  // Return success/error state or redirect
}
```

---

## Authentication (Member)

Location: `app/member/actions.ts`

### `memberLogin(formData: FormData): Promise<void>`

Authenticates a user via email + password; creates a session and sets `session_id` cookie.

**Parameters**:
- `email` (FormData): User email, trimmed and lowercased
- `password` (FormData): Plain-text password

**Validations**:
- Email and password must be non-empty
- Email must match password hash via `bcrypt.compare()`

**Rate Limits**:
- Per IP: 5 attempts / 15 minutes
- Per email: 5 attempts / 15 minutes

**On Success**:
- Creates Session row with 30-day expiry
- Sets `session_id` cookie (httpOnly, secure, sameSite=lax)
- Deletes legacy `member_email` cookie
- Redirects to `/member`

**On Failure**:
- Throws `"Invalid email or password"` (generic to prevent enumeration)
- User sees error message on form

**Usage**:
```tsx
// In a form with action={memberLogin}
<form action={memberLogin}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Login</button>
</form>
```

---

### `memberLogout(): Promise<void>`

Logs out the current user; deletes session and clears cookies.

**Parameters**: None

**On Success**:
- Deletes Session row by `session_id`
- Clears `session_id` and legacy `member_email` cookies
- Redirects to `/member`

**Usage**:
```tsx
<form action={memberLogout}>
  <button type="submit">Logout</button>
</form>
```

---

### `getMemberSession(): Promise<{ id, email, displayName, userRoles, status } | null>`

Fetches the current user's session and profile data. Used by pages to check authentication and authorization.

**Parameters**: None

**Returns**:
- On success: Profile object with `id`, `email`, `displayName`, `userRoles[]`, `status`
- On failure or expired: `null`

**Logic**:
1. Read `session_id` from cookie
2. Look up session in database
3. Check `expiresAt > now()`
4. If expired, delete session and clear cookie
5. Return profile or null

**Usage**:
```typescript
// In a server component or action
const user = await getMemberSession();
if (!user) {
  redirect("/member"); // Not authenticated
}
if (!user.userRoles.includes("ADMIN")) {
  throw new Error("Unauthorized"); // Not admin
}
```

---

## Account Registration

Location: `app/register/actions.ts`

### `registerAccount(_prevState: RegisterState, formData: FormData): Promise<RegisterState>`

Creates a new account-only profile (no verification application). User gets `session_id` cookie and can apply later.

**Parameters**:
- `displayName` (FormData): Display name
- `email` (FormData): Unique email address
- `password` (FormData): Plain-text password (min 8 chars)

**Validations**:
- All three fields required
- Email must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password min 8 characters
- Email must not already exist

**Rate Limits**:
- Per IP: 3 attempts / 1 hour
- Per email: 3 attempts / 1 hour

**On Success**:
- Hashes password with bcryptjs (10 rounds)
- Creates Profile with:
  - `userRoles: ["MEMBER"]` (default)
  - `status: null` (no verification application)
  - `submissionRole: null`
  - Empty arrays: `skills`, `tags`
- Sets `session_id` cookie (legacy `member_email` also set for compatibility)
- Redirects to `/member`

**On Failure**:
- Returns `{ ok: false, error: "..." }`
- User sees error message on form

**Return Type**:
```typescript
type RegisterState = 
  | { ok: false; error: string }
  | { ok: true }
```

**Usage**:
```tsx
import { registerAccount } from "@/app/register/actions";
import { useActionState } from "react";

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerAccount, { ok: false, error: "" });
  
  return (
    <form action={formAction}>
      <input name="displayName" required />
      <input name="email" type="email" required />
      <input name="password" type="password" minLength={8} required />
      {!state.ok && <p className="error">{state.error}</p>}
      <button type="submit">Create Account</button>
    </form>
  );
}
```

---

## Verification Application

Location: `app/apply/actions.ts`

### `submitApplication(_prevState: ApplyState, formData: FormData): Promise<ApplyState>`

Submits or updates a verification application. User must provide role, bio, references, and password (if new account).

**Parameters**:
- `displayName` (FormData): Display name
- `role` (FormData): Role applying for (e.g., "Developer", "Designer")
- `email` (FormData): User email
- `password` (FormData): Password for new accounts only
- `wallet` (FormData, optional): Blockchain wallet address
- `bio` (FormData, optional): User bio (max 800 chars)
- `handle` (FormData, optional): Social handle (max 40 chars)
- `location` (FormData, optional): Location (max 80 chars)
- `telegram`, `xHandle`, `website`, `github`, `linkedin` (optional): Social links
- `chain` (FormData): Blockchain chain (default "solana")
- `skillsCsv` (FormData): Comma-separated skills (max 30)
- `tagsCsv` (FormData): Comma-separated tags (max 30)
- `ref_0_name`, `ref_0_relationship`, `ref_0_contact`, `ref_0_link` (optional): Reference 1 (up to 3 references)
- `company` (FormData): Honeypot field (should be empty)

**Validations**:
- Required: `displayName`, `role`, `email`, `password`
- Email must match regex
- Password min 8 characters (for new accounts)
- URLs must be valid (checked with `new URL()`)
- Skills/tags: max 30 items, items trimmed
- Honeypot: If `company` is set, return fake success (bot trap)

**Rate Limits**:
- Per IP: 3 attempts / 24 hours
- Per email: 3 attempts / 24 hours

**On Success**:
- If new email: Creates Profile with `status: PENDING`
- If existing email with `status: null`: Updates to `status: PENDING` (was account-only)
- If existing email with `status: PENDING`: Rejects (prevents duplicates)
- Creates up to 3 Reference rows
- Hashes password (new accounts only)
- Returns `{ ok: true, id: "profileId" }`

**On Failure**:
- Returns `{ ok: false, error: "..." }`
- User sees error message on form

**Return Type**:
```typescript
type ApplyState = 
  | { ok: false; error: string }
  | { ok: true; id: string }
```

**Usage**:
```tsx
import { submitApplication } from "@/app/apply/actions";
import { useActionState } from "react";

export default function ApplyForm() {
  const [state, formAction] = useActionState(submitApplication, { ok: false, error: "" });
  
  return (
    <form action={formAction}>
      <input name="displayName" required />
      <input name="role" required />
      <input name="email" type="email" required />
      <input name="password" type="password" minLength={8} required />
      <textarea name="bio" maxLength={800} />
      <input name="skillsCsv" placeholder="skill1, skill2, ..." />
      {/* Reference fields... */}
      <input name="company" style={{ display: "none" }} /> {/* Honeypot */}
      {!state.ok && <p className="error">{state.error}</p>}
      {state.ok && <p className="success">Application submitted!</p>}
      <button type="submit">Apply</button>
    </form>
  );
}
```

---

## Admin Management

Location: `app/admin/actions.ts`

### `approveProfile(profileId: string, note?: string): Promise<void>`

Approves a pending profile. Sets `status: APPROVED` and optional reviewer note.

**Parameters**:
- `profileId` (string): Profile ID to approve
- `note` (string, optional): Reviewer note (max 500 chars, recommended)

**Authorization**: Requires `APPROVER` or `ADMIN` role

**On Success**:
- Updates Profile:
  - `status: APPROVED`
  - `reviewerNote: note` (if provided)
  - `reviewedAt: now()`
- Revalidates `/admin`, `/member`, `/directory` paths
- Returns success (no exception)

**On Failure**:
- Throws error if not authorized
- Throws error if profile not found

**Usage**:
```typescript
// Called from approval page
await approveProfile(profileId, "Great references, verified wallet.");
```

---

### `rejectProfile(profileId: string, reason: string): Promise<void>`

Rejects a pending profile. Sets `status: REJECTED` with reason.

**Parameters**:
- `profileId` (string): Profile ID to reject
- `reason` (string): Reason for rejection (max 500 chars, required)

**Authorization**: Requires `APPROVER` or `ADMIN` role

**On Success**:
- Updates Profile:
  - `status: REJECTED`
  - `reviewerNote: reason`
  - `reviewedAt: now()`
- Revalidates paths
- Returns success

**On Failure**:
- Throws error if not authorized or profile not found

**Usage**:
```typescript
await rejectProfile(profileId, "Could not verify references.");
```

---

## Review Workflow

Location: `app/review/actions.ts`

### `moveToApproval(profileId: string): Promise<void>`

Moves a profile from PENDING to READY_FOR_APPROVAL (reviewer marks as ready).

**Parameters**:
- `profileId` (string): Profile ID

**Authorization**: Requires `REVIEWER`, `APPROVER`, or `ADMIN` role

**On Success**:
- Updates Profile: `status: READY_FOR_APPROVAL`
- Revalidates admin/review/approve paths

**Usage**:
```typescript
await moveToApproval(profileId);
```

---

## Utilities

### `requireAdminAccess(): Promise<Profile>`

Helper to check admin access. Throws if user is not admin.

```typescript
// In an admin action
const user = await requireAdminAccess();
// Safe to proceed; user is admin
```

### `requireReviewerAccess(): Promise<Profile>`

Helper to check reviewer access (REVIEWER, APPROVER, or ADMIN).

```typescript
const user = await requireReviewerAccess();
```

### `requireApproverAccess(): Promise<Profile>`

Helper to check approver access (APPROVER or ADMIN).

```typescript
const user = await requireApproverAccess();
```

---

## Error Handling

### Pattern

Server Actions should throw errors or return error states; never swallow exceptions silently.

```typescript
export async function someAction(formData: FormData) {
  try {
    // Validate
    if (!email) {
      return { ok: false, error: "Email is required" };
    }

    // Rate limit
    const limit = await checkUpstashLimit({ ... });
    if (!limit.allowed) {
      return { ok: false, error: "Too many attempts. Please wait." };
    }

    // Authorize
    const user = await getMemberSession();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Execute
    const result = await db.profile.create({ ... });

    // Return success
    return { ok: true, id: result.id };
  } catch (error) {
    console.error("Action error:", error);
    throw error; // Client sees error in useActionState
  }
}
```

### Client-Side Error Handling

Use `useActionState` to capture errors:

```tsx
const [state, formAction, isPending] = useActionState(someAction, initialState);

if (!state.ok) {
  // Show state.error to user
}
```

---

## Form Best Practices

1. **Use `useActionState`**: Captures return value without full-page reload
2. **Disable button while pending**: Prevent double-submit
3. **Show error messages**: User must know why action failed
4. **Honeypot fields**: Hidden fields to trap bots
5. **Validate client-side**: Provide immediate feedback before server call
6. **HTTPS in production**: Passwords sent as FormData (not querystring)

Example form:
```tsx
"use client";

import { submitApplication } from "@/app/apply/actions";
import { useActionState } from "react";

export default function ApplyForm() {
  const [state, formAction, isPending] = useActionState(submitApplication, {
    ok: false,
    error: ""
  });

  return (
    <form action={formAction}>
      <input
        name="email"
        type="email"
        required
        disabled={isPending}
      />
      <input
        name="password"
        type="password"
        minLength={8}
        required
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
      {!state.ok && state.error && (
        <p className="error">{state.error}</p>
      )}
      {state.ok && (
        <p className="success">Application submitted! We'll review it shortly.</p>
      )}
    </form>
  );
}
```

---

## Common Patterns

### Authorization Pattern
```typescript
// At top of action
const user = await getMemberSession();
if (!user?.userRoles.includes("ADMIN")) {
  throw new Error("Unauthorized");
}
```

### Rate Limiting Pattern
```typescript
const hdrs = await headers();
const ip = (hdrs.get("x-forwarded-for") || "unknown").split(",")[0].trim();
const limit = await checkUpstashLimit({ key: `action:${ip}`, limit: 3, window: "1 h" });
if (!limit.allowed) {
  return { ok: false, error: "Too many attempts. Please wait." };
}
```

### Conditional Update Pattern
```typescript
// Update existing or create new
const profile = await prisma.profile.upsert({
  where: { email },
  update: { /* ... */ },
  create: { /* ... */ }
});
```

---

**Last Updated**: January 2026
