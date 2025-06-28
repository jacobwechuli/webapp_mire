import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth();
    
    // Get profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.displayName || '',
          })
          .select()
          .single();

        if (createError) {
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
          );
        }

        return NextResponse.json({ profile: newProfile });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
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
    const user = await requireAuth();
    
    // Parse request body
    const body = await request.json();
    
    // Update profile in database
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name,
        date_of_birth: body.date_of_birth,
        phone: body.phone,
        country: body.country,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
} 