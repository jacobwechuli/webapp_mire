'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, ArrowLeft, LucideIcon, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/overview');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/overview');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // Detect if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      
      if (isMobile) {
        // For mobile, show a message that they'll be redirected
        setError('Redirecting to Google... Please complete the sign-in process.');
      }
      
      await signInWithGoogle();
      
      // Only redirect to overview if we're not on mobile (mobile will handle redirect automatically)
      if (!isMobile) {
        router.push('/overview');
      }
    } catch (error: any) {
      console.error('Google signin error:', error);
      setError(error.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/goldplus-logo.png"
            alt="GoldPlus Logo"
            width={64}
            height={64}
            className="mx-auto h-16 w-16"
          />
          <h2 className="mt-6 text-3xl font-bold text-foreground">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{' '}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
              create a new account
            </Link>
          </p>
        </div>

        <Card className="bg-card text-card-foreground border border-border">
          <CardContent className="p-6">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-background text-foreground border border-border hover:bg-accent h-12 rounded-lg font-medium text-base transition-colors mb-2"
              disabled={googleLoading || isLoading}
            >
              <span className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.6 4.5 29.6 2.5 24 2.5 12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5c10.5 0 20-8.1 20-20 0-1.3-.1-2.1-.3-3.5z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.6 4.5 29.6 2.5 24 2.5c-7.2 0-13 5.8-13 13 0 2.1.5 4.1 1.3 5.7z" fill="#FF3D00"/><path d="M24 44.5c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.8 37 24 37 24 37c-5.8 0-10.7-3.1-13.7-7.7l-7 5.1C7.2 40.2 14.9 44.5 24 44.5z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.6 4.1-6.5 7-11.7 7-5.8 0-10.7-3.1-13.7-7.7l-7 5.1C7.2 40.2 14.9 44.5 24 44.5z" fill="#1976D2"/></g></svg>
                {googleLoading ? 'Signing in...' : 'Sign in with Google'}
              </span>
            </Button>
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-border" />
              <span className="mx-3 text-muted-foreground text-sm">OR</span>
              <div className="flex-grow border-t border-border" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-card-foreground">Email address</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 bg-background text-foreground border-border"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-card-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 bg-background text-foreground border-border"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-border"
                  />
                  <Label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
                    Remember me
                  </Label>
                </div>

                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
