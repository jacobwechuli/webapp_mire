'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name);
      
      // Get the current user and create profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            display_name: formData.name,
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      router.push('/overview');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // After redirect, the user will be signed in. Upsert profile in a useEffect in overview or here if possible.
      // For now, just redirect.
      router.push('/overview');
    } catch (error: any) {
      setError(error.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background">
      {/* Background image with overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/images/home_background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          filter: 'brightness(0.7) blur(1px)',
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen w-full items-center justify-center">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/login" className="flex items-center text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Login
            </Link>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary font-headline">GoldPlus</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4 w-full">
          <Card className="w-full max-w-md shadow-2xl bg-card text-card-foreground border border-border rounded-2xl px-6 py-8">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-primary font-headline mb-1">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground text-base">Join GoldPlus and start your financial journey.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md mb-2">
                  {error}
                </div>
              )}
              <Button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-2 bg-background text-foreground border border-border hover:bg-accent h-12 rounded-lg font-medium text-base transition-colors mb-2"
                disabled={googleLoading || isLoading}
              >
                <span className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.6 4.5 29.6 2.5 24 2.5 12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5c10.5 0 20-8.1 20-20 0-1.3-.1-2.1-.3-3.5z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.6 4.5 29.6 2.5 24 2.5c-7.2 0-13 5.8-13 13 0 2.1.5 4.1 1.3 5.7z" fill="#FF3D00"/><path d="M24 44.5c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.8 37 24 37 24 37c-5.8 0-10.7-3.1-13.7-7.7l-7 5.1C7.2 40.2 14.9 44.5 24 44.5z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.6 4.1-6.5 7-11.7 7-5.8 0-10.7-3.1-13.7-7.7l-7 5.1C7.2 40.2 14.9 44.5 24 44.5c10.5 0 20-8.1 20-20 0-1.3-.1-2.1-.3-3.5z" fill="#1976D2"/></g></svg>
                  {googleLoading ? 'Signing up...' : 'Sign up with Google'}
                </span>
              </Button>
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-border" />
                <span className="mx-3 text-muted-foreground text-sm">OR</span>
                <div className="flex-grow border-t border-border" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-card-foreground text-base">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-background text-foreground border-border placeholder-muted-foreground text-base h-12 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-card-foreground text-base">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-background text-foreground border-border placeholder-muted-foreground text-base h-12 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-card-foreground text-base">Password</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-background text-foreground border-border placeholder-muted-foreground text-base h-12 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-card-foreground text-base">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-background text-foreground border-border placeholder-muted-foreground text-base h-12 rounded-lg"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold h-12 rounded-lg transition-colors mt-2" disabled={isLoading}>
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <UserPlus className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </main>
        <footer className="py-6 md:px-8 border-t bg-background">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-20">
            <p className="text-sm text-center text-muted-foreground">
              © {new Date().getFullYear()} GoldPlus. Secure and Simple.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
} 