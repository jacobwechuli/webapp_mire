"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import Head from 'next/head';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import AiChatbot from '@/components/dashboard/AiChatbot';

const publicRoutes = ['/login', '/signup', '/forgot-password', '/', '/home'];

// Theme initialization script
const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('goldplus-theme');
    if (savedTheme) {
      document.documentElement.classList.remove('dark', 'light', 'green');
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add(savedTheme);
      }
    } else {
      // Set default light theme if no theme is saved
      localStorage.setItem('goldplus-theme', 'default');
      document.documentElement.classList.remove('dark', 'light', 'green');
      document.documentElement.setAttribute('data-theme', 'default');
      document.documentElement.classList.add('default');
    }
  }
};

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);

  useEffect(() => {
    // Initialize theme on component mount
    initializeTheme();
    
    async function fetchProfileDisplayName() {
      if (user?.id) {
        try {
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().displayName) {
            setProfileDisplayName(userDoc.data().displayName);
          } else {
            setProfileDisplayName(null);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfileDisplayName(null);
        }
      }
    }
    fetchProfileDisplayName();
  }, [user?.id]);

  const displayName = profileDisplayName !== null && profileDisplayName !== undefined
    ? String(profileDisplayName)
    : user && user.displayName !== null && user.displayName !== undefined
      ? String(user.displayName)
      : 'Guest';

  // Handler to trigger Adjust Budget modal
  const handleAdjustBudget = () => {
    // Dispatch a custom event that the overview page listens for
    window.dispatchEvent(new CustomEvent('open-adjust-budget'));
  };

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar userName={displayName} onAdjustBudget={handleAdjustBudget} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <DashboardHeader /> */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    // Initialize theme on app startup
    initializeTheme();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Head>
        <title>GoldPlus</title>
        <meta
          name="description"
          content="GoldPlus - Your Personal Finance Companion"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <DashboardShell>{children}</DashboardShell>
        {/* Show chatbot everywhere except homescreen */}
        {pathname !== '/' && pathname !== '/home' && <AiChatbot />}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
} 