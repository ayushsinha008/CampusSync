'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users, GraduationCap, FileText, BarChart2, BookOpen, Bell,
  IndianRupee, Wrench, ClipboardCheck,
} from 'lucide-react';

type AdminData = {
  stats: {
    studentCount: number;
    teacherCount: number;
    assignmentCount: number;
    submissionRate: number;
    campusAttendance: number;
    noticeCount: number;
    classCount: number;
    pendingPayments: number;
    pendingAmount: number;
    openTickets: number;
  };
  recentStudents: Array<{
    _id: string; name: string; email: string; branch?: string; image?: string;
    createdAt: string; submissions: number; assignmentsTotal: number;
  }>;
};

import { Panel } from '@/components/Panel';

function StatCard({
  icon: Icon, title, value, subtitle, badge, href,
}: {
  icon: typeof Users; title: string; value: string; subtitle: string; badge: string; href?: string;
}) {
  const inner = (
    <Panel className="p-5 h-full hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted">
          <Icon className="h-4 w-4 text-brand" strokeWidth={2.2} />
        </div>
        <span className="text-[13px] font-bold text-heading">{title}</span>
      </div>
      <p className="text-[36px] font-extrabold text-heading leading-none tracking-tight">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">{subtitle}</span>
        <span className="bg-[#E8F8EF] text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">{badge}</span>
      </div>
    </Panel>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff/analytics?section=overview')
      .then((res) => res.json())
      .then((json) => {
        if (!json.message) setData(json);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5 w-full">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[200px] rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground text-center py-12">Failed to load administration analytics.</p>;
  }

  const { stats } = data;

  const quickLinks = [
    { label: 'Students', href: '/students', desc: 'Enrollment charts' },
    { label: 'Teachers', href: '/teachers', desc: 'Faculty attendance' },
    { label: 'Attendance', href: '/attendance', desc: 'Subject radar' },
    { label: 'Assignments', href: '/tasks', desc: 'Submission analytics' },
    { label: 'Class Schedule', href: '/timetable', desc: 'Timetable by dept' },
    { label: 'Notices', href: '/notices', desc: 'Announcements' },
  ];

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-heading">College Administration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Campus overview — detailed charts are in each section (Students, Teachers, Attendance, etc.)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-border bg-card px-4 py-3 hover:border-brand/30 hover:bg-brand-muted/40 transition-all"
          >
            <p className="text-sm font-bold text-brand">{link.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} title="Students" value={String(stats.studentCount)} subtitle="Registered" badge="Live" href="/students" />
        <StatCard icon={GraduationCap} title="Teachers" value={String(stats.teacherCount)} subtitle="Faculty on campus" badge="View charts" href="/teachers" />
        <StatCard icon={FileText} title="Assignments" value={String(stats.assignmentCount)} subtitle="Posted for students" badge={`${stats.submissionRate}%`} href="/tasks" />
        <StatCard icon={BarChart2} title="Attendance" value={`${stats.campusAttendance}%`} subtitle="Campus average" badge="Analytics" href="/attendance" />
        <StatCard icon={BookOpen} title="Classes" value={String(stats.classCount)} subtitle="Timetable slots" badge="Scheduled" href="/timetable" />
        <StatCard icon={Bell} title="Notices" value={String(stats.noticeCount)} subtitle="Announcements" badge="Published" href="/notices" />
        <StatCard icon={IndianRupee} title="Pending Fees" value={String(stats.pendingPayments)} subtitle={`₹${stats.pendingAmount.toLocaleString('en-IN')} due`} badge="Financial" href="/payments" />
        <StatCard icon={Wrench} title="Open Tickets" value={String(stats.openTickets)} subtitle="Maintenance" badge="Housing" href="/housing" />
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="h-4 w-4 text-brand" />
              <h3 className="text-[15px] font-bold text-heading">Recent Student Activity</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Latest registrations & assignment submissions</p>
          </div>
          <Link href="/students" className="text-xs font-semibold text-brand hover:underline shrink-0">
            View all students →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left min-w-[640px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium pr-4">Student</th>
                <th className="pb-2 font-medium pr-4">Email</th>
                <th className="pb-2 font-medium pr-4">Branch</th>
                <th className="pb-2 font-medium pr-4">Assignments</th>
                <th className="pb-2 font-medium pr-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No students registered yet</td>
                </tr>
              ) : (
                data.recentStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => router.push('/students')}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={s.image || undefined} alt={s.name} />
                          <AvatarFallback className="bg-brand-muted text-brand text-xs font-bold">
                            {s.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-heading">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.email}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.branch || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-muted px-2.5 py-1 text-xs font-bold text-brand">
                        {s.submissions}/{s.assignmentsTotal} submitted
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
