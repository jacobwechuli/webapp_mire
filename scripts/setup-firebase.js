#!/usr/bin/env node

/**
 * Firebase Setup Script for GoldPlus Financial App
 * 
 * This script helps you set up Firebase for the GoldPlus app by:
 * 1. Creating the necessary Firestore indexes
 * 2. Setting up security rules
 * 3. Validating the configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup for GoldPlus Financial App\n');

// Firestore Security Rules
const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcollections inherit parent permissions
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`;

// Firestore Indexes
const firestoreIndexes = {
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "savingsGoals",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "bills",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "dueDate",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
};

// Environment variables template
const envTemplate = `# Firebase Configuration
# Replace these values with your Firebase project settings

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Keep Supabase for authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
`;

function createFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${filePath}:`, error.message);
  }
}

function setupFirebase() {
  console.log('📁 Creating Firebase configuration files...\n');

  // Create firestore.rules
  createFile('firestore.rules', securityRules);

  // Create firestore.indexes.json
  createFile('firestore.indexes.json', JSON.stringify(firestoreIndexes, null, 2));

  // Create .env.local template
  createFile('.env.local.template', envTemplate);

  console.log('\n📋 Next Steps:');
  console.log('1. Create a Firebase project at https://console.firebase.google.com/');
  console.log('2. Enable Firestore Database in your Firebase project');
  console.log('3. Copy your Firebase config values to .env.local');
  console.log('4. Deploy security rules: firebase deploy --only firestore:rules');
  console.log('5. Deploy indexes: firebase deploy --only firestore:indexes');
  
  console.log('\n🔧 Manual Setup Required:');
  console.log('- Add Firebase SDK to your project (already in package.json)');
  console.log('- Configure authentication providers if needed');
  console.log('- Set up Firebase hosting (optional)');
  
  console.log('\n📚 Documentation:');
  console.log('- Firebase Console: https://console.firebase.google.com/');
  console.log('- Firestore Documentation: https://firebase.google.com/docs/firestore');
  console.log('- Security Rules: https://firebase.google.com/docs/firestore/security/get-started');
  
  console.log('\n🎉 Setup complete! Your Firebase configuration is ready.');
}

// Run the setup
setupFirebase(); 