"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

function calculateAge(dob: string | null) {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function ProfilePage() {
  const { profile, loading, error, updateProfile, refetch } = useProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    country: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth || '',
        phone: profile.phone || '',
        country: profile.country || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    await updateProfile({
      displayName: form.displayName,
      dateOfBirth: form.dateOfBirth,
      phone: form.phone,
      country: form.country,
    });
    setEditing(false);
    refetch();
  };

  const handleChangePassword = () => {
    router.push('/forgot-password');
  };

  const age = calculateAge(editing ? form.dateOfBirth : profile?.dateOfBirth || '');

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <>
      <Script id="profile-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "name": "Profile | GoldPlus",
          "url": "http://goldplus-advisory.com/profile",
          "description": "Manage your GoldPlus profile, update your information, and personalize your experience.",
        })}
      </Script>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
        <div className="w-full max-w-xl mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/overview')}
          >
            ← Back to Overview
          </Button>
        </div>
        <Card className="w-full max-w-xl shadow-lg p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-4">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Full Name:</span>
              {editing ? (
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2"
                />
              ) : (
                <span>{profile?.displayName}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Email:</span>
              <span>{profile?.email}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Age:</span>
              <span>{age}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Date of Birth:</span>
              {editing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2"
                />
              ) : (
                <span>{profile?.dateOfBirth}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Phone Number:</span>
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2"
                />
              ) : (
                <span>{profile?.phone}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Country:</span>
              {editing ? (
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2"
                />
              ) : (
                <span>{profile?.country}</span>
              )}
            </div>
            <div className="pt-6 flex gap-2">
              {editing ? (
                <>
                  <Button variant="gold" size="lg" className="w-full" onClick={handleSave}>Save</Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => { setEditing(false); setForm({
                    displayName: profile?.displayName || '',
                    email: profile?.email || '',
                    dateOfBirth: profile?.dateOfBirth || '',
                    phone: profile?.phone || '',
                    country: profile?.country || '',
                  }); }}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button variant="gold" size="lg" className="w-full" onClick={() => setEditing(true)}>Edit Profile</Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={handleChangePassword}>Change Password</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 