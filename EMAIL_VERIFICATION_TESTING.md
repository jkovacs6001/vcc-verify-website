# Email Verification Testing Guide

## ⚠️ Important: Resend Email Restrictions

**Resend is in testing mode** - you can only send emails to your verified email address (`vampcatcoin@gmail.com`) until you verify a domain.

**To test:**
- Use `vampcatcoin@gmail.com` when filling out the application form

**For production:**
- Verify a domain at [resend.com/domains](https://resend.com/domains)
- Update `EMAIL_FROM` environment variable to use your verified domain (e.g., `noreply@yourdomain.com`)

## How to Test Email Verification

### 1. Register a New Account
- Go to `/apply`
- Fill out the registration form with `vampcatcoin@gmail.com` (or your verified Resend email)
- Submit the application

### 2. Check Your Email
You should receive TWO emails:
1. **Email Verification** - "Verify your email address"
   - Contains a link like: `https://yoursite.com/verify-email/[token]`
   - Valid for 24 hours
2. **Application Submitted** - "We've received your application"

### 3. Click Verification Link
- Click the link in the verification email
- You should see: "Email Verified! ✓"
- The page will confirm your email is verified

### 4. Sign In
- Go to `/member`
- Sign in with your email and password
- If email NOT verified: Yellow banner appears with "Resend Verification Email" button
- If email IS verified: No banner appears

### 5. Test Resend Verification
If you didn't click the link:
- Sign in to `/member`
- Click "Resend Verification Email" button
- Check your email for a new verification link
- Rate limited to 3 attempts per hour

## What Happens

### New User Registration Flow:
1. User fills out application form
2. System generates random 32-byte verification token
3. Token stored in database with 24-hour expiry
4. Verification email sent to user
5. Application emails sent to reviewers/applicant
6. User can sign in but sees verification banner

### Email Verification Flow:
1. User clicks link in email
2. System checks if token exists and is valid
3. System checks if token has expired (24 hours)
4. If valid: Sets `emailVerified = true`, clears token
5. Shows success message

### Edge Cases Handled:
- ✅ Token already used (emailVerified = true)
- ✅ Token expired (> 24 hours old)
- ✅ Invalid token (doesn't exist in database)
- ✅ Rate limiting on resend (3 per hour)
- ✅ User can login before verifying email

## Testing in Development

Since you're testing locally, make sure:
1. `RESEND_API_KEY` is set in `.env.local`
2. `EMAIL_FROM` is set (or uses default)
3. Use a REAL email address you can access
4. Check Resend dashboard for sent emails

## Database Fields Added

```prisma
emailVerified Boolean @default(false)
verificationToken String? @unique
verificationTokenExpiry DateTime?
```

## Files Modified
- `prisma/schema.prisma` - Added verification fields
- `lib/email.ts` - Added `emailVerificationLink()` function
- `app/apply/actions.ts` - Generate token on registration
- `app/verify-email/[token]/page.tsx` - Verification endpoint (NEW)
- `app/member/actions.ts` - Added `resendVerificationEmail()` action
- `app/member/page.tsx` - Added verification banner
