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
  onAddTransaction?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onAddTransaction }) => {
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
    <header className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-8">
              <Image src="/images/goldplus.jpg" alt="GoldPlus Logo" width={120} height={80} className="rounded-xl" />
              <h1 className="text-4xl font-black text-black font-headline tracking-tight">GOLDPLUS</h1>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {pathname === '/dashboard' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-lg px-6 py-3 h-14">
                  <PlusCircle className="mr-3 h-7 w-7" /> Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onAddTransaction && (
                  <DropdownMenuItem onClick={onAddTransaction} className="text-lg py-3">
                    Add Transaction
                  </DropdownMenuItem>
                )}
                {/* <DropdownMenuItem onClick={() => router.push('/savings')} className="text-lg py-3">
                  Add Savings
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center px-4 py-2">
                <Menu className="h-8 w-8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/profile')} className="text-lg py-3">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/theme')} className="text-lg py-3">
                Theme
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg py-3 text-gold cursor-pointer">
                Upgrade Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-lg py-3 text-destructive cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 