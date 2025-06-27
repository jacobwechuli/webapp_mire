"use client";
import React, { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const theme = localStorage.getItem('goldplus-theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme) {
      document.documentElement.classList.add(theme);
    }
  }, []);

  return (
    <div className="flex">
      {pathname !== '/' && pathname !== '/login' && <Sidebar />}
      <div className="flex-1 transition-all duration-300">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </div>
    </div>
  );
} 