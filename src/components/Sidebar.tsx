'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CampusSyncLogo } from '@/components/CampusSyncLogo';
import {
  LayoutDashboard, BookOpen, Calendar, Award, GraduationCap,
  FileText, Receipt, PiggyBank,
  Users, Home,
  ChevronDown, ChevronUp, Clock, ChevronsLeft, ChevronsRight,
  Megaphone, FileBadge, X, UserCircle, LogOut,
  ClipboardList, Shield,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

type RouteItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type RouteGroup = { label: string; items: RouteItem[] };

const studentRouteGroups: RouteGroup[] = [
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
      { href: '/notices', label: 'Notice Board', icon: Megaphone },
      { href: '/housing', label: 'Housing & Dormitory', icon: Home },
    ],
  },
];

const staffRouteGroups: RouteGroup[] = [
  {
    label: 'People',
    items: [
      { href: '/students', label: 'All Students', icon: Users },
      { href: '/teachers', label: 'All Teachers', icon: GraduationCap },
    ],
  },
  {
    label: 'Academic',
    items: [
      { href: '/attendance', label: 'Attendance', icon: BookOpen },
      { href: '/tasks', label: 'Assignments', icon: ClipboardList },
      { href: '/timetable', label: 'Class Schedule', icon: Clock },
      { href: '/calendar', label: 'Academic Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Campus',
    items: [
      { href: '/notices', label: 'Notice Board', icon: Megaphone },
      { href: '/organizations', label: 'Organizations', icon: Users },
      { href: '/housing', label: 'Housing & Dorms', icon: Home },
    ],
  },
];

const STUDENT_DEFAULT_OPEN: Record<string, boolean> = {
  Academic: true,
  Documents: true,
  Financial: true,
  'Students Life': true,
};

const STAFF_DEFAULT_OPEN: Record<string, boolean> = {
  People: true,
  Academic: true,
  Campus: true,
};

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all',
        isActive
          ? 'bg-brand-muted text-brand border-l-[3px] border-l-brand rounded-l-lg'
          : 'text-muted-foreground hover:text-brand hover:bg-card/60',
        collapsed && 'justify-center px-2 border-l-0'
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0',
          isActive ? 'text-brand' : 'text-muted-foreground'
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isStaff = (session?.user as { role?: string })?.role === 'staff';
  const routeGroups = isStaff ? staffRouteGroups : studentRouteGroups;
  const prevPathname = useRef(pathname);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    isStaff ? STAFF_DEFAULT_OPEN : STUDENT_DEFAULT_OPEN
  );

  useEffect(() => {
    setOpenGroups(isStaff ? STAFF_DEFAULT_OPEN : STUDENT_DEFAULT_OPEN);
  }, [isStaff]);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    onMobileClose?.();
  }, [pathname, onMobileClose]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const sidebarContent = (
    <>
      <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
        {!collapsed ? (
          <CampusSyncLogo href="/dashboard" size="md" />
        ) : (
          <CampusSyncLogo href="/dashboard" showText={false} size="sm" className="mx-auto" />
        )}
        <button
          type="button"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="hidden lg:flex text-muted-foreground hover:bg-card transition-colors p-1 rounded-md border border-border bg-card shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden text-muted-foreground hover:bg-muted p-1.5 rounded-md"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 min-h-0">
        <nav className="px-4">
          {!collapsed && isStaff && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-brand-muted/60 px-3 py-2">
              <Shield className="h-4 w-4 text-brand shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-brand">
                College Administration
              </span>
            </div>
          )}

          <div className="mb-4">
            <NavLink
              href="/dashboard"
              label="Dashboard"
              icon={LayoutDashboard}
              isActive={pathname === '/dashboard'}
              collapsed={collapsed}
            />
          </div>

          {!collapsed &&
            routeGroups.map((group, i) => {
              const isOpen = openGroups[group.label];
              return (
                <div key={i} className="mb-3">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center justify-between px-2 mb-1.5 text-[12px] font-bold text-foreground"
                  >
                    {group.label}
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                                    ? 'bg-card text-brand shadow-sm'
                                    : 'text-muted-foreground hover:text-brand hover:bg-card/80'
                                )}
                              >
                                <Icon
                                  className={cn(
                                    'h-4 w-4 shrink-0 stroke-[1.5px]',
                                    isActive ? 'text-brand' : 'text-muted-foreground'
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

          {collapsed && (
            <div className="grid gap-1">
              {routeGroups.flatMap((g) => g.items).map((route) => {
                const Icon = route.icon;
                const isActive =
                  pathname === route.href || pathname.startsWith(`${route.href}/`);
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    title={route.label}
                    className={cn(
                      'flex justify-center rounded-xl p-2.5 transition-all',
                      isActive
                        ? 'bg-brand-muted text-brand'
                        : 'text-muted-foreground hover:text-brand hover:bg-card/60'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      <div className="shrink-0 px-4 pb-4 border-t border-border pt-4 space-y-1">
        <Link
          href="/profile"
          title="Profile"
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all',
            pathname === '/profile'
              ? 'bg-brand-muted text-brand border-l-[3px] border-l-brand rounded-l-lg'
              : 'text-muted-foreground hover:text-brand hover:bg-card/60',
            collapsed && 'justify-center px-2 border-l-0'
          )}
        >
          <UserCircle
            className={cn(
              'h-[18px] w-[18px] shrink-0',
              pathname === '/profile' ? 'text-brand' : 'text-muted-foreground'
            )}
          />
          {!collapsed && <span>{isStaff ? 'Admin Profile' : 'My Profile'}</span>}
        </Link>
        <button
          type="button"
          title="Log out"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-red-500 transition-all hover:bg-red-500/10',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
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
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          'hidden lg:flex flex-col h-full border-r border-border bg-sidebar overflow-hidden transition-all duration-300 shrink-0',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
