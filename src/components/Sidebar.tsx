'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Calendar, Award, GraduationCap,
  FileText, Receipt, PiggyBank,
  Users, Home, Hexagon,
  ChevronDown, ChevronUp, Clock, ChevronsLeft, ChevronsRight,
  Megaphone, FileBadge, X,
} from 'lucide-react';

const routeGroups = [
  {
    label: 'Academic',
    items: [
      { href: '/attendance', label: 'My Class', icon: BookOpen },
      { href: '/timetable', label: 'Class Schedule', icon: Clock },
      { href: '/grades', label: 'Grades & Transcript', icon: Award },
      { href: '/tasks', label: 'Assignments', icon: GraduationCap },
      { href: '/calendar', label: 'Academic Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Documents',
    items: [
      { href: '/transcript', label: 'Official Transcript', icon: FileText },
      { href: '/certificates', label: 'Certificates', icon: FileBadge },
    ],
  },
  {
    label: 'Financial',
    items: [
      { href: '/tuition', label: 'Tuition & Fees', icon: FileText },
      { href: '/payments', label: 'Payment History', icon: Receipt },
      { href: '/financial-aid', label: 'Financial Aid', icon: PiggyBank },
    ],
  },
  {
    label: 'Students Life',
    items: [
      { href: '/organizations', label: 'Organizations', icon: Users },
      { href: '/notices', label: 'Campus Events', icon: Megaphone },
      { href: '/housing', label: 'Housing & Dormitory', icon: Home },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Academic: true,
    Documents: true,
    Financial: true,
    'Students Life': true,
  });

  useEffect(() => {
    onMobileClose?.();
  }, [pathname, onMobileClose]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const sidebarContent = (
    <>
      <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold text-[19px] text-[#1E293B]">
            <div className="bg-[#5B4FCF] text-white p-1.5 rounded-lg shrink-0">
              <Hexagon className="h-5 w-5 fill-current" />
            </div>
            <span>CampusSync</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="bg-[#5B4FCF] text-white p-1.5 rounded-lg">
              <Hexagon className="h-5 w-5 fill-current" />
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="hidden lg:flex text-slate-400 hover:bg-white transition-colors p-1 rounded-md border border-slate-100 bg-white shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden text-slate-400 hover:bg-slate-100 p-1.5 rounded-md"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-4">
          <Link
            href="/dashboard"
            title="Dashboard"
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all mb-4',
              pathname === '/dashboard'
                ? 'bg-[#EEEAFD] text-[#5B4FCF] border-l-[3px] border-l-[#5B4FCF] rounded-l-lg'
                : 'text-slate-500 hover:text-[#5B4FCF] hover:bg-white/60',
              collapsed && 'justify-center px-2 border-l-0'
            )}
          >
            <LayoutDashboard
              className={cn(
                'h-[18px] w-[18px] shrink-0',
                pathname === '/dashboard' ? 'text-[#5B4FCF]' : 'text-slate-400'
              )}
            />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {!collapsed &&
            routeGroups.map((group, i) => {
              const isOpen = openGroups[group.label];
              return (
                <div key={i} className="mb-3">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center justify-between px-2 mb-1.5 text-[12px] font-bold text-[#334155]"
                  >
                    {group.label}
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-0.5">
                          {group.items.map((route, j) => {
                            const Icon = route.icon;
                            const isActive =
                              pathname === route.href || pathname.startsWith(`${route.href}/`);

                            return (
                              <Link
                                key={j}
                                href={route.href}
                                className={cn(
                                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-all',
                                  isActive
                                    ? 'bg-white text-[#5B4FCF] shadow-sm'
                                    : 'text-slate-500 hover:text-[#5B4FCF] hover:bg-white/80'
                                )}
                              >
                                <Icon
                                  className={cn(
                                    'h-4 w-4 shrink-0 stroke-[1.5px]',
                                    isActive ? 'text-[#5B4FCF]' : 'text-slate-400'
                                  )}
                                />
                                {route.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </nav>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-100 bg-[#FAFAFB] transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          'hidden lg:flex flex-col h-full border-r border-slate-100 bg-[#FAFAFB] overflow-hidden transition-all duration-300 shrink-0',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
