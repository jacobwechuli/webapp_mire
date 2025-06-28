'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface SupabaseUser {
  id: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to create or update profile
const createOrUpdateProfile = async (userId: string, email: string | null, displayName: string | null) => {
  try {
    // Try to insert a new profile, if it fails (already exists), update it
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        display_name: displayName || '',
      });

    if (insertError && insertError.code === '23505') {
      // Profile already exists, update it
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: email,
          display_name: displayName || '',
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    } else if (insertError) {
      console.error('Error creating profile:', insertError);
    }
  } catch (error) {
    console.error('Error in createOrUpdateProfile:', error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? null,
          displayName: sessionUser.user_metadata?.displayName ?? null,
        });
        // Create/update profile for existing session
        createOrUpdateProfile(
          sessionUser.id,
          sessionUser.email ?? null,
          sessionUser.user_metadata?.displayName ?? null
        );
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? null,
          displayName: sessionUser.user_metadata?.displayName ?? null,
        });
        // Create/update profile when auth state changes
        await createOrUpdateProfile(
          sessionUser.id,
          sessionUser.email ?? null,
          sessionUser.user_metadata?.displayName ?? null
        );
      } else {
        setUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Create/update profile after successful sign in
    if (data.user) {
      await createOrUpdateProfile(
        data.user.id,
        data.user.email ?? null,
        data.user.user_metadata?.displayName ?? null
      );
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { displayName },
      },
    });
    if (error) throw error;
    
    // Create profile after successful sign up
    if (data.user) {
      await createOrUpdateProfile(
        data.user.id,
        data.user.email ?? null,
        displayName ?? null
      );
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 