import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request);
    
    // Get profile from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Profile doesn't exist, create one
      const newProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.name || '',
        photoURL: user.picture || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userRef, newProfile);
      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile: userDoc.data() });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request);
    
    const body = await request.json();
    const { displayName, email } = body;

    // Update profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    await updateDoc(userRef, updateData);

    // Get updated profile
    const updatedDoc = await getDoc(userRef);
    return NextResponse.json({ profile: updatedDoc.data() });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 