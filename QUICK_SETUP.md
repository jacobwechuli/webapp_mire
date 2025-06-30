# 🚀 Quick Firebase Setup Guide

## Option 1: Automated Setup (Recommended)

Run the setup script:
```bash
npm run setup:auth
```

This will guide you through entering your Firebase configuration and create the `.env.local` file automatically.

## Option 2: Manual Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it (e.g., "goldplus-app")
4. Follow the setup wizard

### Step 2: Enable Authentication
1. In Firebase Console, click "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add `localhost` to authorized domains

### Step 3: Create Firestore Database
1. Click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location

### Step 4: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click web icon (</>) to add web app
4. Copy the config values

### Step 5: Get Service Account Key
1. In Project Settings, go to "Service accounts" tab
2. Click "Generate new private key"
3. Download the JSON file
4. Extract `project_id`, `client_email`, and `private_key`

### Step 6: Create .env.local
Create a file named `.env.local` in your project root with:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

## Step 7: Test the Setup

```bash
npm run dev
```

Visit http://localhost:9002 and test:
- Sign up with email/password
- Sign in with Google
- Check that users appear in Firebase Console

## 🔧 Troubleshooting

### "Missing Firebase configuration" error
- Check that all environment variables are set
- Restart the dev server after creating `.env.local`

### Google sign-in not working
- Verify Google provider is enabled in Firebase Console
- Check that `localhost` is in authorized domains

### JWT verification failing
- Ensure service account credentials are correct
- Check that private key is properly formatted with `\n` for newlines

## 📚 More Help

See `FIREBASE_AUTH_SETUP.md` for detailed instructions and troubleshooting. 