'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Metadata } from 'next';
import Script from 'next/script';

const sidebarItems = [
  { key: 'profile', label: 'Profile' },
  { key: 'account', label: 'Account' },
];

export const metadata: Metadata = {
  title: 'Settings | GoldPlus',
  description: 'Customize your GoldPlus experience and manage your account settings.',
  openGraph: {
    title: 'Settings | GoldPlus',
    description: 'Customize your GoldPlus experience and manage your account settings.',
    url: 'http://goldplus-advisory.com/settings',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Settings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Settings | GoldPlus',
    description: 'Customize your GoldPlus experience and manage your account settings.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/settings',
  },
};

export default function SettingsPage() {
  const [selected, setSelected] = useState('profile');
  const { user, resetPassword, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch displayName from Firestore on mount
  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        try {
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists() && userDoc.data().displayName) {
            setDisplayName(userDoc.data().displayName);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    }
    fetchProfile();
  }, [user?.id]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        displayName: displayName,
        updatedAt: new Date().toISOString(),
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      setError('No email address found');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await resetPassword(user.email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script id="settings-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Settings | GoldPlus",
          "url": "http://goldplus-advisory.com/settings",
          "description": "Customize your GoldPlus experience and manage your account settings.",
        })}
      </Script>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <div className="p-4 space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelected(item.key)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selected === item.key
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {selected === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and display name.
                  </CardDescription>
                </CardHeader>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email address cannot be changed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>

                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>

                  {message && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{message}</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {selected === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and preferences.
                  </CardDescription>
                </CardHeader>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Password</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Reset your password by sending a reset link to your email.
                      </p>
                      <Button
                        onClick={handleResetPassword}
                        disabled={loading}
                        variant="outline"
                      >
                        {loading ? 'Sending...' : 'Reset Password'}
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Sign Out</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sign out of your account on this device.
                      </p>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>

                  {message && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{message}</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 