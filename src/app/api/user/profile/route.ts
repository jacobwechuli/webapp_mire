import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { rateLimiters } from '@/lib/rateLimit';

interface ProfileUpdateData {
  displayName?: string;
  email?: string;
}

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

    // Verify authentication and get user from session
    const user = await requireAuth(request);
    
    // Get database connection
    const db = getDatabase();
    
    // Get profile from Prisma
    const profile = await db.user.findUnique({
      where: { id: user.uid },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        dateOfBirth: true,
        phone: true,
        country: true,
        onboarding: true,
        onboardingComplete: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      // Profile doesn't exist, create one
      const newProfile = await db.user.create({
        data: {
          id: user.uid,
          email: user.email || '',
          displayName: user.name || '',
          photoUrl: user.picture || '',
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          photoUrl: true,
          dateOfBirth: true,
          phone: true,
          country: true,
          onboarding: true,
          onboardingComplete: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile });
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
    
    const body = await request.json() as ProfileUpdateData;
    const { displayName, email } = body;

    // Get database connection
    const db = getDatabase();

    // Update profile in Prisma
    const updateData: Record<string, any> = {};
    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }
    if (email !== undefined) {
      updateData.email = email;
    }

    const updatedProfile = await db.user.update({
      where: { id: user.uid },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        dateOfBirth: true,
        phone: true,
        country: true,
        onboarding: true,
        onboardingComplete: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 