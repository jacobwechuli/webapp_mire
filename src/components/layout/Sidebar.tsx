'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, List, PiggyBank, BookOpen, Settings, Target, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Avatar } from '@/components/ui/avatar';

const goals = [
  { name: 'Emergency Fund', href: '/savings?goal=emergency', icon: Target },
  { name: 'Vacation', href: '/savings?goal=vacation', icon: Target },
  { name: 'Business', href: '/savings?goal=business', icon: Target },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className="h-screen p-2 bg-transparent">
      <Card className="flex flex-col h-full w-64 max-w-full rounded-2xl shadow-xl bg-background border border-border">
        {/* Top: Logo and Menu */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-8 bg-primary rounded-lg" />
            <span className="font-bold text-lg text-foreground">GoldPlus</span>
          </div>
          <button
            className="md:hidden p-2 rounded hover:bg-muted"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-2 px-2 py-4">
          <span className="text-xs text-muted-foreground px-2 mb-2">Main</span>
          <Link href="/overview" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-base font-medium text-foreground">
            <List className="h-5 w-5 text-primary" /> Overview
          </Link>
          <Link href="/savings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-base font-medium text-foreground">
            <PiggyBank className="h-5 w-5 text-primary" /> Savings
          </Link>
          <Link href="/tutorials" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-base font-medium text-foreground">
            <BookOpen className="h-5 w-5 text-primary" /> Tutorials
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-base font-medium text-foreground">
            <Settings className="h-5 w-5 text-primary" /> Settings
          </Link>
          {/* Collapsible Goals Section */}
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="goals">
              <AccordionTrigger className="px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-lg">
                <Target className="h-5 w-5 text-primary mr-2" /> Goals
              </AccordionTrigger>
              <AccordionContent className="pl-8 flex flex-col gap-1">
                {goals.map((goal) => (
                  <Link key={goal.name} href={goal.href} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-primary/10 text-sm text-foreground">
                    <goal.icon className="h-4 w-4 text-primary" /> {goal.name}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </nav>
        {/* Bottom: User Profile */}
        <div className="mt-auto px-4 py-4 border-t border-border flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <User className="h-6 w-6 text-primary" />
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Jane Doe</span>
            <span className="text-xs text-muted-foreground">jane@goldplus.com</span>
          </div>
        </div>
      </Card>
    </aside>
  );
};

export default Sidebar; 