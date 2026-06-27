'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F6FA]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F5F6FA]">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
