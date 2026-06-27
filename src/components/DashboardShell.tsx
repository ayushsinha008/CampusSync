'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-page">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-page">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-8 pb-safe">
          {children}
        </main>
      </div>
    </div>
  );
}
