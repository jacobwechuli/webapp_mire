import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { userCache, cacheUtils } from '@/lib/cache';
import { rateLimiters } from '@/lib/rateLimit';

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.user.checkLimit(request);
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many profile requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        }
      );
    }

    // Verify authentication
    const user = await requireAuth(request);
    
    // Check cache first
    const cacheKey = cacheUtils.generateUserKey(user.uid, 'profile');
    const cached = userCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json({ profile: cached });
    }
    
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
      
      // Cache the new profile
      userCache.set(cacheKey, newProfile, 30 * 60 * 1000); // 30 minutes
      
      return NextResponse.json({ profile: newProfile });
    }

    const profileData = userDoc.data();
    
    // Cache the profile data
    userCache.set(cacheKey, profileData, 30 * 60 * 1000); // 30 minutes
    
    return NextResponse.json({ profile: profileData });
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
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.user.checkLimit(request);
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many profile update requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        }
      );
    }

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
    const updatedProfile = updatedDoc.data();
    
    // Update cache with new profile data
    const cacheKey = cacheUtils.generateUserKey(user.uid, 'profile');
    userCache.set(cacheKey, updatedProfile, 30 * 60 * 1000); // 30 minutes
    
    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 