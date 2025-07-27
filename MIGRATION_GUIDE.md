# Google Sign-In Migration Guide

## Quick Setup

1. **Add email credentials to .env.local:**
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

2. **Generate Gmail App Password:**
   - Go to Google Account → Security → App Passwords
   - Generate password for "Mail"
   - Use this password (not your regular Gmail password)

3. **Run Migration:**
```bash
npm run migrate:users
```

## What This Does

- Finds all users who signed in with Google
- Gives each user a temporary password
- Sends them an email with login credentials
- Saves results to `migrated_users.json`

## After Migration

1. **Disable Google Sign-In** in Firebase Console:
   - Authentication → Sign-in method → Google → Disable

2. **Update your app** to remove Google sign-in buttons

3. **Users can now log in** with email + temporary password

## Files Created

- `scripts/migrate-users.ts` - Migration script
- `migrated_users.json` - Results log
- `MIGRATION_GUIDE.md` - This guide

## Troubleshooting

- Check `migrated_users.json` for failed migrations
- Ensure Firebase Admin credentials are correct
- Verify Gmail app password is working 