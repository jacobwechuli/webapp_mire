'use client';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const sidebarItems = [
  { key: 'profile', label: 'Profile' },
  { key: 'account', label: 'Account' },
];

export default function SettingsPage() {
  const [selected, setSelected] = useState('profile');
  const { user, resetPassword, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch displayName from profiles table on mount
  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        if (data && data.display_name) {
          setDisplayName(data.display_name);
        }
      }
    }
    fetchProfile();
  }, [user?.id]);

  const handleUpdateDisplayName = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) {
        setError('Failed to update display name');
      } else {
        setMessage('Display name updated successfully');
      }
    } catch (err) {
      setError('An error occurred while updating display name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/overview')}
        >
          ← Back to Overview
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <div className="p-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelected(item.key)}
                  className={`w-full text-left p-2 rounded mb-2 ${
                    selected === item.key
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
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
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <Button onClick={handleUpdateDisplayName} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Display Name'}
                </Button>
                {message && (
                  <p className="text-green-600 text-sm">{message}</p>
                )}
                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}
              </div>
            </Card>
          )}

          {selected === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <div className="p-6 space-y-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => resetPassword(user?.email || '')}>
                    Reset Password
                  </Button>
                  <Button variant="destructive" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 