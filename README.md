# VCC Verify

A Next.js directory and verification platform for a vetted community of professionals. Features secure authentication, role-based access, verification applications, and admin dashboards.

## 🚀 Quick Start

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

Open [http://localhost:3000](http://localhost:3000)

## 📋 Features

- **Account Creation**: Register for a free account at `/register`
- **Verification Applications**: Apply to be a verified member at `/apply` with bio, skills, references
- **Public Directory**: Browse verified community members at `/directory`
- **Member Dashboard**: View your verification status and account details at `/member`
- **Admin Review**: Multi-step workflow (REVIEWER → APPROVER → final decision)
- **Role-Based Access**: MEMBER, REVIEWER, APPROVER, ADMIN with flexible multi-role support
- **Secure Auth**: bcryptjs password hashing, server-side sessions, rate limiting
- **Rate Limiting**: Distributed via Upstash Redis (or in-memory fallback for dev)

## 📁 Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)**: Architecture, setup, common tasks, troubleshooting
- **[SECURITY.md](SECURITY.md)**: Authentication, sessions, rate limiting, access control, checklist
- **[API.md](API.md)**: Server Actions reference (memberLogin, registerAccount, submitApplication, admin actions)

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: bcryptjs + server-side sessions
- **Rate Limiting**: Upstash Redis (with in-memory fallback)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)

## 📦 Environment Variables

**Required**:
- `DATABASE_URL`: PostgreSQL connection string

**Recommended (production)**:
- `UPSTASH_REDIS_REST_URL`: Upstash Redis endpoint
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis API token
- `RESEND_API_KEY`: Resend API key (free tier: 100 emails/day)
- `EMAIL_FROM`: Sender address (e.g., "VCC <no-reply@yourdomain.com>")
- `APP_BASE_URL`: Site URL for email links

**Note**: Email recipients are automatically pulled from the database based on `userRoles` (REVIEWER, APPROVER).

**Graceful degradation**:
- Without Upstash → in-memory rate limiting (dev-only)
- Without Resend → emails skipped (console warnings only)

## 🔄 User Flows

### Registration → Application → Approval

1. **Register** (`/register`): Create account with email + password
2. **Apply** (`/apply`): Submit verification application (bio, skills, references)
3. **Review** (`/review`): Reviewers assess and move to approval queue
4. **Approve** (`/approve`): Approvers make final decision
5. **Directory** (`/directory`): Approved members appear in public directory

### Member Dashboard

- View account status (account-only, pending, approved, rejected)
- See your roles (MEMBER, REVIEWER, APPROVER, ADMIN)
- Quick links to apply or manage your profile

## 🔐 Security

- Passwords hashed with bcryptjs (10 rounds; ~100ms/hash)
- Server-side sessions; cookies httpOnly, secure, sameSite=lax
- Rate limiting on auth endpoints (5/15min login, 3/1hr register, 3/24hr apply)
- Role-based access control on all sensitive pages
- Honeypot fields in forms to trap bots
- Inputs validated with length clamping and URL validation

**See [SECURITY.md](SECURITY.md) for details and deployment checklist.**

## 🚢 Deployment

### Environment Setup

```bash
# Set in your hosting platform (Vercel, AWS, etc.)
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Build & Run

```bash
npm run build
npm start
```

### Database Backups

```bash
# Manual backup
./scripts/backup-db.sh

# Set up daily backups via cron
0 2 * * * /path/to/scripts/backup-db.sh
```

**See [DEVELOPMENT.md](DEVELOPMENT.md#backups) for details.**

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Upstash Rate Limit](https://upstash.com/docs/redis/features/ratelimiting)

## 📝 License

[License info here]

## 🤝 Contributing

[Contributing guidelines here]
