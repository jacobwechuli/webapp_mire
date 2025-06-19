'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, List, PiggyBank } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-background border-r z-50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex flex-col h-full">
        <button
          className="flex items-center justify-center h-16 w-full border-b focus:outline-none"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-8 w-8 text-primary" />
        </button>
        <nav className="flex-1 flex flex-col gap-2 mt-4">
          <Link href="/dashboard" passHref legacyBehavior>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium">
              <List className="h-6 w-6" />
              {!collapsed && <span>Transactions</span>}
            </a>
          </Link>
          <Link href="/savings" passHref legacyBehavior>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-lg font-medium">
              <PiggyBank className="h-6 w-6" />
              {!collapsed && <span>Savings</span>}
            </a>
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 