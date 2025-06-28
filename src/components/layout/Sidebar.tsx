'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, PiggyBank, BookOpen, Menu, ChevronLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Savings', href: '/savings', icon: PiggyBank },
  { name: 'Tutorials', href: '/tutorials', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 z-50 bg-card text-primary rounded-full p-3 shadow-lg focus:outline-none md:hidden border border-border"
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
          'fixed top-0 left-0 h-full bg-card text-card-foreground flex flex-col transition-all duration-300 z-40 border-r border-border',
          // Mobile styles
          'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop styles
          'md:translate-x-0 md:static',
          desktopCollapsed ? 'md:w-20' : 'md:w-64'
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
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-all duration-300',
                pathname === item.href ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-card-foreground text-muted-foreground',
                desktopCollapsed ? 'md:justify-center md:px-2' : ''
              )}
              onClick={() => setMobileOpen(false)}
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
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
};

export default Sidebar;