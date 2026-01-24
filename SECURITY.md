# Security Practices

This document outlines security implementation and considerations for VCC Verify.

## Authentication & Passwords

### Password Hashing
- **Algorithm**: bcryptjs (bcrypt wrapper)
- **Cost**: 10 salt rounds (default; ~100ms/hash)
- **Storage**: Stored in `Profile.passwordHash` as salted hash
- **Comparison**: Always use `bcrypt.compare()` for verification

```typescript
// Hashing (on register/apply)
const hash = await bcrypt.hash(password, 10);

// Verification (on login)
const isValid = await bcrypt.compare(passwordInput, storedHash);
```

**Why not plain text / weak hashing?**
- Plain text exposed if database is breached
- Weak hashing (MD5, SHA1) is crackable in seconds
- bcrypt is slow by design—makes brute-force attacks impractical

### Password Requirements
- Minimum 8 characters (enforced in forms)
- No complexity requirements (accessibility—users should use a password manager)

**Future**: Consider passkeys/WebAuthn for passwordless auth if user base grows.

## Sessions

### Implementation
- **Server-side**: Sessions stored in PostgreSQL `Session` model
- **Cookie**: `session_id` links user to session; contains no user data
- **Duration**: 30 days; checked for expiry on every request
- **Cleanup**: Expired sessions deleted on read or when logout triggered

```typescript
// Create session on login
const session = await prisma.session.create({
  data: { profileId: userId, expiresAt: futureDate },
  select: { id: true }
});
cookieStore.set("session_id", session.id, {
  httpOnly: true,       // Not accessible to JavaScript
  secure: true,         // HTTPS only (prod)
  sameSite: "lax",      // CSRF protection
  maxAge: 30 * 24 * 60 * 60
});
```

**Why server-side sessions?**
- **JWT risks**: Stateless tokens can't be revoked immediately; if leaked, attacker keeps access until expiry
- **Server sessions**: Immediate logout by deletion; server owns the truth
- **Smaller cookies**: `session_id` is tiny; less data in requests

### Session Validation
Every protected page calls `getMemberSession()`:
1. Read `session_id` from cookie
2. Look up session in database
3. Check `expiresAt > now()`
4. Return profile or null

If expired or missing → redirect to login.

## Rate Limiting

### Primary: Upstash Redis
- **Distributed**: Safe for multi-instance deployments (e.g., Vercel autoscaling)
- **Sliding window**: Tracks recent timestamps; prevents bursts
- **Fallback**: In-memory Map if Upstash env not set

```typescript
// Upstash client initialized on first call
const redis = Redis.fromEnv(); // Reads UPSTASH_REDIS_REST_URL + TOKEN
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  prefix: "vcc"
});
```

### Limits by Endpoint

| Endpoint | Limit | Window | Keys |
|----------|-------|--------|------|
| POST /member (login) | 5 | 15 min | `login:<ip>`, `login-email:<email>` |
| POST /register | 3 | 1 hour | `register:<ip>`, `register-email:<email>` |
| POST /apply | 3 | 24 hr | `apply:<ip>`, `apply-email:<email>` |

**Key strategy**:
- **Per-IP**: Prevents distributed attacks; uses `x-forwarded-for` or `x-real-ip` header
- **Per-email**: Prevents single attacker from retrying same email across IPs

If either limit exceeded → reject with "Too many attempts. Please wait."

### Fallback Behavior
Without Upstash env vars, falls back to in-memory limiter:
- Uses `Map<string, number[]>` to track attempt timestamps
- Works for local dev; **NOT cluster-safe** (doesn't share across processes)
- Console logs when fallback is used

## Role-Based Access Control

### Roles
```typescript
enum UserRole {
  MEMBER          // Default; can apply, view own profile
  REVIEWER        // Can review applications, see admin page
  APPROVER        // Can approve/reject applications, see admin page
  ADMIN           // Full access; can manage users and oversee all
}
```

### Model
- **Multi-role**: `Profile.userRoles: UserRole[]` (allows ADMIN + REVIEWER)
- **Check pattern**: `userRoles.includes("REQUIRED_ROLE")`

```typescript
// In server action
export async function requireAdminAccess() {
  const user = await getMemberSession();
  if (!user?.userRoles.includes("ADMIN")) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

### Access Map

| Page/Action | Required Role(s) |
|-------------|------------------|
| /member | MEMBER (default) |
| /apply | MEMBER (default) |
| /admin | ADMIN \| REVIEWER \| APPROVER |
| /review | REVIEWER \| APPROVER \| ADMIN |
| /approve | APPROVER \| ADMIN |
| /directory | Public, but filters to APPROVED only |
| Admin actions (approve/reject) | ADMIN \| APPROVER |

**Why multi-role?**
- Admins often need reviewer/approver capabilities
- Allows flexible permission combinations without creating fragile hierarchies

## Input Validation

### Current State
- **Email**: Regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Password**: Minimum 8 characters
- **URLs**: `new URL(url)` constructor (throws if invalid)
- **Text fields**: Max length clamping (e.g., 255 chars for wallet)
- **Arrays**: Max item count (e.g., 30 skills max)

### Honeypot
- `submitApplication()` checks for `company` field (bots often fill hidden fields)
- If present, returns success (fake) to confuse bots

### Future: Zod Schemas
Currently mixed validation logic. Plan: Consolidate with Zod for:
- Reusable schema definitions
- Better error messages
- Type safety (Zod → TypeScript types)

Example:
```typescript
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
});
```

## Database Security

### Connection
- **URL**: PostgreSQL connection string (env var; never hardcoded)
- **SSL**: Use SSL in production (standard via connection string)
- **User**: Create role with limited permissions (not superuser)

### Backups
- **Tool**: `pg_dump` with gzip compression
- **Location**: `scripts/backup-db.sh` (see DEVELOPMENT.md for details)
- **Schedule**: Via cron job (e.g., daily)
- **Storage**: Secure location, not in repo

### Migrations
- **Tool**: Prisma Migrate
- **Safety**: Always test in staging before production
- **Reversibility**: Keep migrations backward-compatible when possible

## Dependency Security

### Key Dependencies
- `bcryptjs`: Well-maintained, audited, no critical advisories
- `@upstash/ratelimit`: Official Upstash client; actively maintained
- `prisma`: Industry standard; regular security updates

### Checking for Vulnerabilities
```bash
npm audit
```

Fix critical/high severity issues before deploying to production.

## Data Privacy

### Sensitive Data
- Passwords: Never log, never send in responses
- Session IDs: Server-side only; never expose
- Email addresses: Visible to admins but not public

### User Deletion
- Currently no user deletion UI (apply if needed)
- Implementation would: Delete sessions + profile + references
- Consider legal retention requirements (GDPR, etc.)

### Audit Logging
- Currently: No audit trail of admin actions
- Recommended: Log approve/reject with admin ID + timestamp
- Future task: Add to `reviewedAt`, `reviewerNote`, admin action log

## Deployment Security Checklist

Before going to production:

- [ ] Set `NODE_ENV=production` in host
- [ ] Rotate test/dev credentials (admin passwords, API keys)
- [ ] Verify `secure: true` in cookies (automatic with `NODE_ENV === 'production'`)
- [ ] Set strong PostgreSQL passwords (not default)
- [ ] Enable HTTPS on domain (auto with Vercel/major hosts)
- [ ] Set `UPSTASH_REDIS_REST_URL` and `TOKEN` in production env
- [ ] Test rate limiting is working (`npm run build && npm start`, spam requests)
- [ ] Backup database before going live
- [ ] Set up cron for daily backups
- [ ] Review admin user list—remove test accounts
- [ ] Enable database connection pooling if using Prisma Accelerate
- [ ] Set up monitoring/logging for errors and rate limit hits
- [ ] Test disaster recovery (restore from backup to staging)

## Common Vulnerabilities & Mitigations

### SQL Injection
- **Mitigation**: Prisma ORM parameterizes all queries
- **Check**: Never use string interpolation in queries

### XSS (Cross-Site Scripting)
- **Mitigation**: React escapes content by default; Next.js built-in CSP
- **Check**: Never use `dangerouslySetInnerHTML` without sanitization

### CSRF (Cross-Site Request Forgery)
- **Mitigation**: Next.js disables CSRF for Server Actions (they require POST + same-origin)
- **Check**: Explicit action handler prevents form hijacking

### Brute-Force Attacks
- **Mitigation**: Rate limiting on login/register/apply
- **Check**: Logs show if under attack; consider IP blocking if sustained

### Session Hijacking
- **Mitigation**: Server-side sessions, httpOnly cookies, secure flag
- **Check**: Never transmit `session_id` over HTTP

### Privilege Escalation
- **Mitigation**: Role checks in every sensitive action
- **Check**: Manual audit of admin actions; only ADMIN can grant roles

## Incident Response

### Suspected Breach
1. **Check logs**: Did rate limiting detect unusual activity?
2. **Database**: Any unauthorized profile changes?
3. **Sessions**: Are there unexpected sessions from foreign IPs?
4. **Password reset**: Notify affected users to reset passwords
5. **Review access logs**: Did an admin do something unusual?

### Steps to Take
```bash
# View suspicious activity
psql $DATABASE_URL -c "SELECT id, expiresAt FROM \"Session\" WHERE expiresAt > now() ORDER BY expiresAt DESC;"

# Force logout all users (emergency)
psql $DATABASE_URL -c "DELETE FROM \"Session\";"

# Reset specific user password (manual until UI added)
# (Requires script or direct DB update)
```

## Responsible Disclosure

If you find a security issue:
1. **Do NOT** post publicly
2. Email security contact with details
3. Allow 30 days for response before disclosure
4. Coordinate patch + disclosure timing

---

**Last Updated**: January 2026
**Next Review**: Every quarter or after major changes
