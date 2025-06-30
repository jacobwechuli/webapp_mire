"use client";

import React, { useEffect, useState } from 'react';
import { LogOut, User, PlusCircle, Menu } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardHeaderProps {
  // Removed onAddTransaction prop
}

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  // Hide on scroll down, show on scroll up
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      // Optionally handle error
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/overview" className="flex items-center gap-3 md:ml-0 ml-20">
            <Image src="/images/goldplus.jpg" alt="GoldPlus Logo" width={48} height={48} className="rounded-lg" />
            <h1 className="text-2xl font-black text-foreground font-gliker tracking-tight">Home</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center px-3 py-2">
                  <Menu className="h-7 w-7 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border text-foreground min-w-[160px]">
                <DropdownMenuItem onClick={() => router.push('/profile')} className="text-base py-2">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="text-base py-2">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/theme')} className="text-base py-2">
                  Theme
                </DropdownMenuItem>
                <DropdownMenuItem className="text-base py-2 text-primary cursor-pointer">
                  Upgrade Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-base py-2 text-destructive cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" className="px-6 py-3 h-12 text-base font-semibold shadow hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 