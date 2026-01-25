# Development Guide

## Overview

**VCC Verify** is a Next.js directory and verification platform for a community of vetted professionals. It combines public profiles, verification applications, role-based admin dashboards, and secure authentication.

## Stack

- **Framework**: Next.js 16 (App Router, Server Actions, Server Components)
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: bcryptjs (password hashing), Session model (server-side sessions)
- **Rate Limiting**: Upstash Redis (distributed), in-memory fallback (dev)
- **Styling**: Tailwind CSS
- **Types**: TypeScript (strict mode)
- **Validation**: Zod (partial—see Roadmap)

## Architecture

### Directory Structure

```
app/
  ├── page.tsx              # Homepage landing
  ├── layout.tsx            # Root layout
  ├── globals.css
  ├── admin/                # Admin dashboard (role-gated)
  │   ├── page.tsx
  │   └── actions.ts
  ├── apply/                # Verification application form
  │   ├── page.tsx
  │   └── actions.ts
  ├── register/             # Account creation only
  │   ├── page.tsx
  │   └── actions.ts
  ├── member/               # Member dashboard & login
  │   ├── page.tsx
  │   └── actions.ts
  ├── review/               # Review applications (role-gated)
  │   ├── page.tsx
  │   └── actions.ts
  ├── approve/              # Approve applications (role-gated)
  │   ├── page.tsx
  │   └── actions.ts
  └── directory/            # Browse verified profiles
      ├── page.tsx
      └── [id]/
          └── page.tsx

components/
  ├── NavBar.tsx            # Top navigation
  ├── NavBarWrapper.tsx     # Server wrapper for session detection
  ├── DirectoryList.tsx     # Profile grid
  ├── ProfessionalCard.tsx  # Profile card
  ├── SearchBar.tsx
  ├── TrustWeb.tsx          # Trust/reference visualization
  └── FeaturedProfiles.tsx

lib/
  ├── db.ts                 # Prisma singleton
  ├── rateLimit.ts          # In-memory limiter (fallback)
  ├── upstashRateLimit.ts   # Distributed limiter (primary)
  └── mockData.ts           # Seed/test data

prisma/
  ├── schema.prisma         # Data models
  └── migrations/           # Schema version history

scripts/
  └── backup-db.sh          # PostgreSQL backup utility
```

### Data Models

#### Profile
- **Core**: `id`, `email` (unique), `passwordHash`, `displayName`
- **Public**: `handle`, `location`, `bio`, `skills`, `tags`, `website`, `github`, `linkedin`, `telegram`, `xHandle`
- **Web3**: `chain`, `wallet`
- **Verification**: `submissionRole`, `status` (null = account-only), `reviewerNote`, `reviewedAt`
- **Permissions**: `userRoles[]` (enum: MEMBER, REVIEWER, APPROVER, ADMIN)
- **Relations**: `sessions[]`, `references[]`

#### Session
- **Server-side session store**: `id`, `profileId`, `expiresAt`, `createdAt`
- Expires in 30 days; invalidated by `expiresAt` check on every request
- Linked via `session_id` cookie (httpOnly, secure, sameSite=lax)

#### Reference
- Up to 3 references per profile (MVP limit)
- `name`, `relationship`, `contact`, `link`, `notes`

### User Flows

#### 1. Registration (Account-Only)
- User signs up via `/register`
- Email + password + display name required
- Creates Profile with `status: null` (no verification yet)
- User gets `session_id` cookie
- Redirects to `/member` dashboard

**Rate limit**: 3 attempts per hour per IP and email

#### 2. Verification Application
- User fills detailed form at `/apply` (role, bio, references, links, etc.)
- Password required (new accounts) or can be skipped (existing session)
- Creates/updates Profile with `status: PENDING`
- Accessible to MEMBER and above

**Rate limit**: 3 attempts per 24 hours per IP and email

#### 3. Member Dashboard (`/member`)
- Shows account status (null → prompt to apply; PENDING → waiting; APPROVED → verified)
- Displays `userRoles[]` and available features
- Login form for unauthenticated visitors

#### 4. Admin Review Workflow
- **Admin page** (`/admin`): Overview of pending/ready applications
- **Review page** (`/review`): REVIEWER+ role submits feedback, moves to READY_FOR_APPROVAL
- **Approve page** (`/approve`): APPROVER+ role approves/rejects
- All role-gated via `userRoles` check in session

#### 5. Directory
- Public browsing at `/directory`
- Shows only APPROVED profiles
- Admins/reviewers excluded
- Individual profile details at `/directory/[id]`

### Authentication & Authorization

#### Password Hashing
- Uses `bcryptjs` with salt rounds = 10
- Stored in `Profile.passwordHash`
- Never log or expose passwords

#### Sessions
- Created in `memberLogin()` → sets `session_id` cookie
- Deleted in `memberLogout()` → clears cookie
- Validated on every request via `getMemberSession()`
- Auto-expires after 30 days + checked on read

#### Role-Based Access Control (RBAC)
Each page checks `userRoles.includes(REQUIRED_ROLE)`:

| Role | Access |
|------|--------|
| MEMBER | Apply, member dashboard, directory |
| REVIEWER | Review applications, admin page |
| APPROVER | Approve/reject applications, admin page |
| ADMIN | All of above + user management |

Admin role can be combined with REVIEWER/APPROVER for flexibility.

### Rate Limiting

**Primary**: Upstash Redis (distributed, production-safe)
**Fallback**: In-memory Map (dev-only when Upstash env not set)

#### Limits by Action
- **Login** (`login:<ip>`, `login-email:<email>`): 5 attempts / 15 minutes
- **Register** (`register:<ip>`, `register-email:<email>`): 3 attempts / 1 hour
- **Apply** (`apply:<ip>`, `apply-email:<email>`): 3 attempts / 24 hours

Uses sliding window; returns remaining wait time if exceeded.

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Environment variables (see below)

### Local Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

### Environment Variables

**Required (always)**:
- `DATABASE_URL`: PostgreSQL connection string
- `PRISMA_DATABASE_URL`: Direct DB URL (for Prisma Accelerate bypass)

**Optional (production)**:
- `UPSTASH_REDIS_REST_URL`: Upstash Redis REST endpoint
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis API token
- `RESEND_API_KEY`: Resend API key for email notifications
- `EMAIL_FROM`: Sender email address (e.g., "VCC Verify <no-reply@yourdomain.com>")
- `APP_BASE_URL` or `NEXT_PUBLIC_SITE_URL`: Full site URL (e.g., https://verify.vcc.com)

**Without Upstash**, rate limiting falls back to in-memory (not cluster-safe).

**Without Resend**, emails are skipped with console warnings (application still works).

## Email Notifications

### Email Flow

The platform sends automated emails at key points:

1. **Application submitted**: Applicant gets confirmation; all users with `REVIEWER` role get alert
2. **Review approved**: Applicant and all users with `APPROVER` role notified when moved to approval queue
3. **Review rejected**: Applicant notified of rejection
4. **Final approval**: Applicant gets approval confirmation
5. **Final rejection**: Applicant notified with encouragement to re-apply

**Recipients are pulled from the database** based on `userRoles` — no need to configure email lists in environment variables.

### Resend Setup (Recommended)

**Free tier**: 100 emails/day, 3,000/month — perfect for verification workflows.

#### Quick Start (Development)

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
   EMAIL_FROM=onboarding@resend.dev
   APP_BASE_URL=http://localhost:3000
   ```

#### Production Setup (Custom Domain)

1. In Resend dashboard: Add and verify your domain
2. Add DNS records (SPF, DKIM, DMARC) provided by Resend
3. Wait for verification (~5-10 minutes)
4. Update environment:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
   EMAIL_FROM=VCC Verify <no-reply@verify.vcc.com>
   APP_BASE_URL=https://verify.vcc.com
   ```

**Without RESEND_API_KEY**, emails are gracefully skipped (logged to console).

### Testing Emails Locally

```bash
# Grant yourself REVIEWER role in the database
psql $DATABASE_URL -c "UPDATE \"Profile\" SET \"userRoles\" = '{MEMBER,REVIEWER}' WHERE email = 'you@example.com';"

# Submit a test application
# Check your inbox for confirmation + reviewer alert
```

**Email recipients are determined by database roles**:
- Users with `REVIEWER` in `userRoles` receive new application alerts
- Users with `APPROVER` in `userRoles` receive ready-for-approval alerts

## Common Tasks

### Add a New Role

1. Update `prisma/schema.prisma`:
   ```prisma
   enum UserRole {
     // ... existing
     NEW_ROLE
   }
   ```

2. Create migration:
   ```bash
   npx prisma migrate dev --name add_new_role
   ```

3. Update role checks in pages (e.g., `requireAdminAccess()` in admin actions):
   ```typescript
   if (!userRoles.includes("NEW_ROLE")) {
     throw new Error("Unauthorized");
   }
   ```

### Add a New Profile Field

1. Update schema:
   ```prisma
   model Profile {
     // ... existing
     newField: String?  // nullable for backward compatibility
   }
   ```

2. Create migration:
   ```bash
   npx prisma migrate dev --name add_new_field
   ```

3. Update any server actions that set/read this field
4. Update UI forms if needed

### Debug Authentication Issues

1. **Check session exists**:
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM \"Session\" LIMIT 5;"
   ```

2. **Check profile password hash**:
   ```bash
   psql $DATABASE_URL -c "SELECT id, email, passwordHash FROM \"Profile\" WHERE email = 'user@example.com';"
   ```

3. **Clear all sessions** (dev only):
   ```bash
   psql $DATABASE_URL -c "DELETE FROM \"Session\";"
   ```

### Test Rate Limiting

**With Upstash** (default): Uses distributed sliding window
**Without Upstash** (fallback): Uses in-memory Map

To test fallback locally:
- Don't set `UPSTASH_REDIS_REST_URL`
- Trigger login 6 times rapidly → should reject on attempt 6

## Deployment

### Environment Setup

1. Set all required env vars in your hosting platform (Vercel, AWS, etc.)
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Backups

Automated backups via `scripts/backup-db.sh`:
```bash
# Manual backup
./scripts/backup-db.sh

# Set up cron (example: daily at 2 AM)
0 2 * * * /path/to/vcc-verify-website/scripts/backup-db.sh
```

Backups stored in `backups/` (add to `.gitignore`).

### Build & Start

```bash
npm run build
npm start
```

## Performance Considerations

- **Session queries**: Indexed on `profileId` for fast lookups
- **Profile queries**: Indexed on `status` for admin filtering and `wallet` for lookups
- **Rate limiting**: Upstash Redis is O(1) with negligible latency
- **Static generation**: Homepage can be pre-rendered; directory uses ISR if needed

## Security Checklist

- ✓ Passwords hashed with bcryptjs (10 rounds)
- ✓ Sessions server-side only; cookies httpOnly
- ✓ CSRF protected via Next.js built-in (disabled for Server Actions by default; safe)
- ✓ Rate limiting on auth endpoints
- ✓ Role-based access control on sensitive pages
- ✓ No secrets in .env.example
- ✓ Backups encrypted and stored securely

**Before production**:
- Rotate any test credentials
- Enable `secure: true` for cookies (already set via `NODE_ENV === 'production'`)
- Set strong `NODE_ENV=production`
- Use strong PostgreSQL passwords
- Lock down Upstash Redis to your IP range if possible

## Troubleshooting

### Build Fails: "Property 'get' does not exist"
- Likely `headers()` used without `await`
- Next.js 16 requires: `const hdrs = await headers();`

### Login Redirects to /member, then 404
- Check that session was created: `SELECT COUNT(*) FROM "Session";`
- Check `sessionId` cookie is set (DevTools → Application → Cookies)

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running and accessible
- For Prisma Accelerate issues, set `PRISMA_DATABASE_URL` to direct URL

### Rate Limiting Always Passes (Upstash Not Working)
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- Test connectivity: `curl -H "Authorization: Bearer <TOKEN>" https://<URL>/get/test-key`
- Falls back to in-memory if misconfigured (visible in console logs)

## Roadmap

- [ ] Email verification on register
- [ ] Zod schema consolidation (input validation)
- [ ] Audit logging (admin actions)
- [ ] Email notifications (approval/rejection)
- [ ] Admin user management UI (add/remove roles)
- [ ] Search filtering on directory
- [ ] 2FA for admin accounts
- [ ] Profile image uploads

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Upstash Rate Limit](https://upstash.com/docs/redis/features/ratelimiting)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
