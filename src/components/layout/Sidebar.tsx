'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, PiggyBank, BookOpen, Menu, ChevronLeft, User, LogOut, Palette, ArrowUpCircle, DollarSign } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Goals', href: '/goals', icon: PiggyBank },
  { name: 'Tutorials', href: '/tutorials', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  userName: string;
  onAdjustBudget?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onAdjustBudget }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      // Optionally handle error
    }
  };

  // Fixed mobile navigation handler
  const handleMobileNavigation = (href: string) => {
    // Close mobile menu first
    setMobileOpen(false);
    
    // Use setTimeout to ensure menu closes before navigation
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  // Fixed mobile action handler
  const handleMobileAction = (action: () => void) => {
    setMobileOpen(false);
    setTimeout(action, 100);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 bg-card text-primary rounded-full p-3 shadow-lg focus:outline-none md:hidden border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Toggle Button */}
      <button
        className="hidden md:block fixed top-4 z-50 bg-card text-primary rounded-full p-2 shadow-lg focus:outline-none transition-all duration-300 border border-border"
        style={{
          left: desktopCollapsed ? '20px' : '240px'
        }}
        onClick={() => setDesktopCollapsed(!desktopCollapsed)}
        aria-label="Toggle sidebar"
      >
        <ChevronLeft 
          size={20} 
          className={cn(
            'transition-transform duration-300',
            desktopCollapsed ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-card text-card-foreground flex flex-col transition-all duration-300 border-r border-border',
          // Mobile styles
          'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop styles
          'md:translate-x-0 md:static',
          desktopCollapsed ? 'md:w-20' : 'md:w-64',
          // Ensure sidebar is above header
          'z-50'
        )}
      >
        <div className="flex items-center px-8 py-8 md:px-4 md:justify-center">
          <span className={cn(
            'text-3xl font-bold transition-opacity duration-300 text-primary',
            desktopCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100'
          )}>
            {desktopCollapsed ? userName.charAt(0).toUpperCase() : userName}
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-8 md:px-4">
          {navItems.map((item) => (
            <React.Fragment key={item.name}>
              {/* Mobile: Use Link instead of button for better reliability */}
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-all duration-300 md:hidden w-full',
                  pathname === item.href ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-card-foreground text-muted-foreground'
                )}
                onClick={() => setMobileOpen(false)}
                title={item.name}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <span className="transition-opacity duration-300">{item.name}</span>
              </Link>
              
              {/* Desktop: Use Link as before */}
              <Link
                href={item.href}
                className={cn(
                  'hidden md:flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-all duration-300',
                  pathname === item.href ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-card-foreground text-muted-foreground',
                  desktopCollapsed ? 'md:justify-center md:px-2' : ''
                )}
                title={desktopCollapsed ? item.name : undefined}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <span className={cn(
                  'transition-opacity duration-300',
                  desktopCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100'
                )}>
                  {item.name}
                </span>
              </Link>
            </React.Fragment>
          ))}
          {/* Adjust Budget Option - Mobile */}
          <button
            type="button"
            className={cn(
              'flex md:hidden items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-all duration-300 w-full hover:bg-accent hover:text-card-foreground text-muted-foreground',
            )}
            onClick={() => handleMobileAction(() => onAdjustBudget && onAdjustBudget())}
            title="Adjust Budget"
          >
            <span className="transition-opacity duration-300">Adjust Budget</span>
          </button>
          {/* Adjust Budget Option - Desktop */}
          <button
            type="button"
            className={cn(
              'hidden md:flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-all duration-300 hover:bg-accent hover:text-card-foreground text-muted-foreground',
              desktopCollapsed ? 'md:justify-center md:px-2' : ''
            )}
            onClick={onAdjustBudget}
            title="Adjust Budget"
          >
            {/* <DollarSign className="h-6 w-6 flex-shrink-0" /> */}
            <span className={cn(
              'transition-opacity duration-300',
              desktopCollapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100'
            )}>
              Adjust Budget
            </span>
          </button>
        </nav>

        {/* Account actions for mobile only */}
        {user && (
          <div className="md:hidden px-8 pb-8 mt-auto flex flex-col gap-2 border-t border-border pt-4">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium hover:bg-accent hover:text-card-foreground text-muted-foreground transition-all duration-300"
              onClick={() => setMobileOpen(false)}
            >
              <User className="h-6 w-6 flex-shrink-0" />
              <span>Profile</span>
            </Link>
            
            <Link
              href="/theme"
              className="flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium hover:bg-accent hover:text-card-foreground text-muted-foreground transition-all duration-300"
              onClick={() => setMobileOpen(false)}
            >
              <Palette className="h-6 w-6 flex-shrink-0" />
              <span>Theme</span>
            </Link>
            
            <button
              className="flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium hover:bg-accent hover:text-primary transition-all duration-300 text-primary"
              onClick={() => handleMobileAction(() => router.push('#'))}
            >
              <ArrowUpCircle className="h-6 w-6 flex-shrink-0" />
              <span>Upgrade Plan</span>
            </button>
            
            <button
              className="flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium hover:bg-accent hover:text-destructive transition-all duration-300 text-destructive"
              onClick={() => handleMobileAction(handleLogout)}
            >
              <LogOut className="h-6 w-6 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
};

export default Sidebar;