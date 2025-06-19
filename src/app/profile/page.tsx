import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  // Mock user data
  const user = {
    fullName: 'Jacob Wechuli',
    email: 'jacob@example.com',
    age: 28,
    dob: '1996-01-15',
    phone: '+254 700 000000',
    country: 'Kenya',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-xl shadow-lg p-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Full Name:</span>
            <span>{user.fullName}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Age:</span>
            <span>{user.age}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Date of Birth:</span>
            <span>{user.dob}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Phone Number:</span>
            <span>{user.phone}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Country:</span>
            <span>{user.country}</span>
          </div>
          <div className="pt-6">
            <Button variant="gold" size="lg" className="w-full">Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 