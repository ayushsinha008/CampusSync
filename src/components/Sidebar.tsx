'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, BookOpen, Calendar, Award, GraduationCap, 
  FileText, CreditCard, Receipt, PiggyBank,
  Users, PartyPopper, Home, ChevronLeft, Hexagon,
  ChevronDown, ChevronUp, Clock, ChevronsLeft,
  Megaphone, FileBadge
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
    ]
  },
  {
    label: 'Documents',
    items: [
      { href: '/transcript', label: 'Official Transcript', icon: FileText },
      { href: '/certificates', label: 'Certificates', icon: FileBadge },
    ]
  },
  {
    label: 'Financial',
    items: [
      { href: '/tuition', label: 'Tuition & Fees', icon: FileText },
      { href: '/payments', label: 'Payment History', icon: Receipt },
      { href: '/financial-aid', label: 'Financial Aid', icon: PiggyBank },
    ]
  },
  {
    label: 'Students Life',
    items: [
      { href: '/organizations', label: 'Organizations', icon: Users },
      { href: '/notices', label: 'Campus Events', icon: Megaphone },
      { href: '/housing', label: 'Housing & Dormitory', icon: Home },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Academic': true,
    'Documents': true,
    'Financial': true,
    'Students Life': true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col w-[240px] h-full border-r border-slate-100 bg-[#FAFAFB] overflow-hidden">
      <div className="flex h-[72px] items-center justify-between px-5 pt-1">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[19px] text-slate-800">
          <div className="bg-[#2D2B52] text-white p-1.5 rounded-lg">
            <Hexagon className="h-5 w-5 fill-current" />
          </div>
          CampusSync
        </Link>
        <button className="text-slate-400 hover:bg-slate-100 transition-colors p-1 rounded-md border border-slate-100 bg-white">
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        <nav className="grid gap-1 px-4">
          {/* Dashboard Item */}
          <div className="mb-3">
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-bold transition-all',
                pathname === '/dashboard' 
                  ? 'bg-white shadow-sm border border-slate-100 text-[#2D2B52]' 
                  : 'text-slate-500 hover:text-[#2D2B52] hover:bg-white/50'
              )}
            >
              <LayoutDashboard className={cn("h-[18px] w-[18px]", pathname === '/dashboard' ? "text-[#2D2B52] fill-[#2D2B52]/20" : "text-slate-400")} />
              Dashboard
            </Link>
          </div>

          {/* Accordion Groups */}
          {routeGroups.map((group, i) => {
            const isOpen = openGroups[group.label];
            return (
              <div key={i} className="mb-2.5">
                <button 
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-2 mb-1.5 text-[12px] font-bold text-slate-700 hover:text-slate-900"
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
                      <div className="grid gap-0.5 mt-0.5">
                        {group.items.map((route, j) => {
                          const Icon = route.icon;
                          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
                          
                          return (
                            <Link
                              key={j}
                              href={route.href}
                              className={cn(
                                'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-all',
                                isActive 
                                  ? 'bg-white shadow-sm border border-slate-100 text-[#2D2B52]' 
                                  : 'text-slate-500 hover:text-[#2D2B52] hover:bg-white'
                              )}
                            >
                              <Icon className={cn("h-[16px] w-[16px] stroke-[1.5px]", isActive ? "text-[#2D2B52] fill-[#2D2B52]/10" : "text-slate-400")} />
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
    </div>
  );
}
