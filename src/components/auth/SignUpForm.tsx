'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
      router.push('/onboarding');
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
      if (isMobile) {
        // For mobile: Use redirect flow instead of popup
        // Set a flag in localStorage to track the auth attempt
        localStorage.setItem('google_auth_attempt', 'signup');
        localStorage.setItem('auth_redirect_path', '/onboarding');
        
        // Use redirect method for mobile
        await signInWithGoogle('redirect');
      } else {
        // For desktop: Use popup flow with better error handling
        await signInWithGoogle('popup');
        router.push('/onboarding');
      }
    } catch (error: any) {
      console.error('Google signup error:', error);
      
      // Clear any auth attempt flags on error
      if (isMobile) {
        localStorage.removeItem('google_auth_attempt');
        localStorage.removeItem('auth_redirect_path');
      }
      
      // Better error messages
      if (error.code === 'popup-closed-by-user' || error.message?.includes('popup')) {
        setError('Sign-up was cancelled. Please try again.');
      } else if (error.code === 'network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message || 'Google sign-up failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle redirect result on mobile
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (isMobile && typeof window !== 'undefined') {
        const authAttempt = localStorage.getItem('google_auth_attempt');
        const redirectPath = localStorage.getItem('auth_redirect_path');
        
        if (authAttempt === 'signup') {
          try {
            // Check if there's a pending redirect result
            const result = await signInWithGoogle('getRedirectResult');
            
            if (result && result.user) {
              // Clear the flags
              localStorage.removeItem('google_auth_attempt');
              localStorage.removeItem('auth_redirect_path');
              
              // Redirect to onboarding
              router.push(redirectPath || '/onboarding');
            }
          } catch (error) {
            console.error('Redirect result error:', error);
            localStorage.removeItem('google_auth_attempt');
            localStorage.removeItem('auth_redirect_path');
          }
        }
      }
    };

    handleRedirectResult();
  }, [isMobile, router, signInWithGoogle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="https://goldplus-advisory.com" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card className="bg-card text-card-foreground border border-border">
          <CardContent className="p-6">
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2 bg-background text-foreground border border-border hover:bg-accent h-12 rounded-lg font-medium text-base transition-colors mb-2"
              disabled={googleLoading || isLoading}
            >
              <span className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.6 4.5 29.6 2.5 24 2.5 12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5c10.5 0 20-8.1 20-20 0-1.3-.1-2.1-.3-3.5z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.6 4.5 29.6 2.5 24 2.5c-7.2 0-13 5.8-13 13 0 2.1.5 4.1 1.3 5.7z" fill="#FF3D00"/><path d="M24 44.5c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.8 37 24 37 24 37c-5.8 0-10.7-3.1-13.7-7.7l-7 5.1C7.2 40.2 14.9 44.5 24 44.5z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.6 4.1-6.5 7-11.7 7-5.8 0-10.7-3.1-13.7-7.7l-7 5.1C7.2 40.2 14.9 44.5 24 44.5c10.5 0 20-8.1 20-20 0-1.3-.1-2.1-.3-3.5z" fill="#1976D2"/></g></svg>
                {googleLoading ? (isMobile ? 'Redirecting to Google...' : 'Creating account...') : 'Sign up with Google'}
              </span>
            </Button>
            
            {/* Show mobile-specific message */}
            {isMobile && googleLoading && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                You'll be redirected to Google's sign-in page. Please complete the process and you'll be brought back here.
              </p>
            )}
            
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-border" />
              <span className="mx-3 text-muted-foreground text-sm">OR</span>
              <div className="flex-grow border-t border-border" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-card-foreground">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-background text-foreground border-border"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-card-foreground">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-background text-foreground border-border"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-card-foreground">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-background text-foreground border-border"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-card-foreground">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-background text-foreground border-border"
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 