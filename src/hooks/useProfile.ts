import { useState, useEffect } from 'react';
import { Profile } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create profile if it doesn't exist
  const createProfile = async () => {
    if (!user?.id) return;

    try {
      const userRef = doc(db, 'users', user.id);
      const profileData = {
        id: user.id,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingComplete: false,
        budget: { incomes: [{ source: '', amount: 0 }], incomeFrequency: 'monthly', expenses: [{ category: '', amount: 0 }] },
      };

      await setDoc(userRef, profileData);
      return profileData;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to fetch existing profile
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Profile doesn't exist, create one
        const newProfile = await createProfile();
        setProfile(newProfile as Profile);
        return;
      }

      setProfile(userDoc.data() as Profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return;

    try {
      setError(null);
      const userRef = doc(db, 'users', user.id);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updateData);
      
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  // Fetch profile on mount and when user changes
  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
} 