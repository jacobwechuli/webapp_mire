'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const testimonials = [
  {
    quote: 'This app changed my financial life! I finally feel in control.',
    name: 'Alex M.'
  },
  {
    quote: 'The budgeting tools are so easy to use and actually fun!',
    name: 'Priya S.'
  },
  {
    quote: 'I paid off $5,000 in debt in just 6 months. Thank you!',
    name: 'Jordan L.'
  },
  {
    quote: 'The mobile app is gorgeous and makes tracking my money a breeze.',
    name: 'Samira K.'
  },
];

const features = [
  {
    title: 'Budgeting',
    description: 'Create and manage your budgets with ease.',
    href: '/overview',
  },
  {
    title: 'Goals',
    description: 'Set, track, and achieve your goals.',
    href: '/goals',
  },
  {
    title: 'Personal Tutorials',
    description: 'Learn personal finance skills step by step.',
    href: '/tutorials/personal/budgeting',
  },
  {
    title: 'Entrepreneurship',
    description: 'Grow your business knowledge and skills.',
    href: '/tutorials/entrepreneurship/business-idea-generation',
  },
  {
    title: 'Settings',
    description: 'Manage your account and preferences.',
    href: '/settings',
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading while checking authentication (optional, can remove if not needed)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-card-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Remove the authentication check - render content for everyone
  return (
    <div className="bg-background min-h-screen w-full text-card-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-background" style={{background: 'linear-gradient(120deg, hsl(var(--background)) 60%, hsl(var(--primary)/0.1) 100%)'}}>
        <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-primary drop-shadow-lg">Take Control of Your Money</h1>
          <p className="text-lg md:text-2xl text-card-foreground mb-8">GoldPlus helps you budget, save, and achieve your financial dreams—all in one beautiful app.</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/overview" className="inline-block px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:bg-primary/90 transition">Go to Dashboard</Link>
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-block px-8 py-4 rounded-xl border-2 border-primary text-primary font-bold text-lg shadow-lg hover:bg-primary hover:text-primary-foreground transition">
                  Get it on PlayStore
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Coming Soon!</DialogTitle>
                  <DialogDescription>
                    The GoldPlus app will be available on the Play Store soon. Stay tuned!
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center mt-12 md:mt-0">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-primary bg-card">
            <Image src="/images/display1.jpg" alt="Mobile App" width={320} height={640} className="object-cover w-[320px] h-[640px]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 px-6 md:px-20 bg-card flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="group bg-background border border-border rounded-2xl p-8 flex flex-col items-start shadow-lg hover:border-primary hover:scale-105 transition-transform">
              <h3 className="text-2xl font-semibold mb-2 text-primary group-hover:underline">{feature.title}</h3>
              <p className="text-card-foreground text-lg mb-2">{feature.description}</p>
              <span className="mt-auto text-primary font-bold group-hover:underline">Go to {feature.title} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 px-6 md:px-20 bg-background flex flex-col items-center border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-8 shadow-lg flex flex-col">
              <p className="text-xl text-card-foreground mb-4 italic">"{t.quote}"</p>
              <span className="text-primary font-bold text-lg">— {t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PlayStore Anchor (for future use) */}
      <div id="playstore" className="w-full flex flex-col items-center py-12 bg-card">
        <p className="text-muted-foreground mt-4">Coming soon to Android devices!</p>
      </div>
    </div>
  );
} 