import { NextRequest } from 'next/server';
import { auth } from './firebase';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK for server-side operations
let firebaseAdmin: any;

if (!getApps().length) {
  try {
    firebaseAdmin = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

// Verify JWT token from request headers
export const verifyAuth = async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No token provided' };
  }

  const token = authHeader.substring(7);
  
  try {
    if (!firebaseAdmin) {
      return { user: null, error: 'Firebase Admin not initialized' };
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    return { user: decodedToken, error: null };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { user: null, error: 'Invalid token' };
  }
};

// Get current user from session (for API routes)
export const getCurrentUser = async (req: NextRequest) => {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Require authentication middleware
export const requireAuth = async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

// Helper function to get user ID from token
export const getUserIdFromToken = async (token: string) => {
  try {
    if (!firebaseAdmin) {
      return null;
    }
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
}; 