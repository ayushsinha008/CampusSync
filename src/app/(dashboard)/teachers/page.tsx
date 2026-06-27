'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, BookOpen, Users, Search } from 'lucide-react';
import { TeacherSectionCharts } from '@/components/admin/SectionChartBlocks';

type TeacherRow = {
  _id: string;
  name: string;
  email?: string;
  department: string;
  status: 'Present' | 'On Leave' | 'Absent';
  subjects: string[];
  stats: { subjectCount: number; studentCount: number };
};

function Panel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function statusBadgeClass(status: string) {
  if (status === 'Present') return 'bg-emerald-50 text-emerald-700 border-0';
  if (status === 'On Leave') return 'bg-amber-50 text-amber-700 border-0';
  return 'bg-red-50 text-red-600 border-0';
}

function scrollMainToTop() {
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function TeachersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  useEffect(() => {
    if (status === 'loading') return;
    if (!isStaff) {
      router.replace('/dashboard');
      return;
    }
    fetch('/api/staff/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTeachers(data);
      })
      .finally(() => setLoading(false));
  }, [status, isStaff, router]);

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.subjects.some((s) => s.toLowerCase().includes(q))
    );
  });

  if (status === 'loading' || loading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  if (!isStaff) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">All Teachers</h1>
        <p className="mt-1 text-sm text-slate-500">Faculty directory — tap any teacher for full profile & status</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search by name, email, department or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/20"
        />
      </div>

      <Panel className="divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-400 text-sm">No teachers found</p>
        ) : (
          filtered.map((t) => (
            <Link
              key={t._id}
              href={`/teachers/${t._id}`}
              onClick={scrollMainToTop}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F5F6FA] active:bg-[#EEEAFD] transition-colors cursor-pointer"
            >
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm shrink-0">
                <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] font-bold">
                  {t.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#1E293B] truncate">{t.name}</p>
                <p className="text-xs text-slate-500 truncate">{t.email || t.department}</p>
                <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" />{t.department}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />{t.stats.subjectCount} subjects
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />{t.stats.studentCount} students
                  </span>
                </div>
              </div>
              <Badge className={`shrink-0 pointer-events-none ${statusBadgeClass(t.status)}`}>{t.status}</Badge>
            </Link>
          ))
        )}
      </Panel>

      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B]">Faculty Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Teacher status overview & department distribution</p>
        </div>
        <TeacherSectionCharts />
      </div>
    </div>
  );
}
