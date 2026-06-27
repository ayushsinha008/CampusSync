'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users, GraduationCap, FileText, BarChart2,
  ClipboardCheck, ArrowUpRight, TrendingUp,
} from 'lucide-react';
import { Panel } from '@/components/Panel';
import {
  EnrollmentAreaChart,
  TeacherDonutChart,
  AssignmentStackedChart,
} from '@/components/admin/ChartKit';

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
  enrollmentTrend?: Array<{ month: string; students: number }>;
  teacherStatus?: { present: number; onLeave: number; absent: number };
  assignmentAnalytics?: Array<{
    id: string;
    title: string;
    submitted: number;
    pending: number;
    rate: number;
  }>;
  attendanceBySubject?: Array<{ subject: string; percentage: number }>;
  recentStudents: Array<{
    _id: string; name: string; email: string; branch?: string; image?: string;
    createdAt: string; submissions: number; assignmentsTotal: number;
  }>;
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function ProgressBar({ value, className = 'bg-brand' }: { value: number; className?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${className}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  title,
  value,
  subtitle,
  badge,
  href,
  progress,
  progressClass,
  accent,
  delay = 0,
}: {
  icon: typeof Users;
  title: string;
  value: string;
  subtitle: string;
  badge?: string;
  href?: string;
  progress?: number;
  progressClass?: string;
  accent: string;
  delay?: number;
}) {
  const content = (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4, delay }}
      className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-brand/25 hover:shadow-md"
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 blur-2xl ${accent}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
          <Icon className="h-5 w-5 text-brand" strokeWidth={2.2} />
        </div>
        {href && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:bg-brand-muted group-hover:text-brand">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="relative mt-4 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="relative mt-1 text-[32px] font-extrabold leading-none tracking-tight text-heading sm:text-[36px]">
        {value}
      </p>
      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">{subtitle}</span>
        {badge && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {badge}
          </span>
        )}
      </div>
      {progress !== undefined && (
        <div className="relative mt-3">
          <ProgressBar value={progress} className={progressClass} />
        </div>
      )}
    </motion.div>
  );

  return href ? <Link href={href} className="block h-full">{content}</Link> : content;
}

function MiniStat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border bg-card/80 px-4 py-3 transition-colors hover:border-brand/30 hover:bg-brand-muted/30"
    >
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <span className="text-[15px] font-bold text-heading">{value}</span>
    </Link>
  );
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
      <div className="space-y-6 w-full">
        <Skeleton className="h-[140px] rounded-2xl" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[148px] rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
        <Skeleton className="h-[220px] rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground text-center py-12">Failed to load administration analytics.</p>;
  }

  const { stats } = data;

  return (
    <div className="w-full space-y-6">
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5B4FCF] via-[#6B5FD6] to-[#4338CA] px-6 py-7 sm:px-8 sm:py-8 text-white shadow-lg"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              Live campus overview
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">College Administration</h1>
            <p className="mt-2 max-w-xl text-sm text-indigo-100/90">
              Monitor enrollment, faculty, attendance, and assignments from one place. Open any section for detailed charts.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 min-w-0 lg:min-w-[320px]">
            {[
              { label: 'Students', value: stats.studentCount },
              { label: 'Attendance', value: `${stats.campusAttendance}%` },
              { label: 'Faculty', value: stats.teacherCount },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm sm:px-4">
                <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-100/80 sm:text-[11px]">{item.label}</p>
                <p className="mt-1 text-xl font-extrabold sm:text-2xl">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          title="Students"
          value={String(stats.studentCount)}
          subtitle="Registered on campus"
          badge="Live"
          href="/students"
          accent="bg-indigo-500/20"
          delay={0.05}
        />
        <KpiCard
          icon={GraduationCap}
          title="Teachers"
          value={String(stats.teacherCount)}
          subtitle="Faculty on campus"
          badge={`${data.teacherStatus?.present ?? 0} present`}
          href="/teachers"
          accent="bg-violet-500/20"
          delay={0.1}
        />
        <KpiCard
          icon={BarChart2}
          title="Attendance"
          value={`${stats.campusAttendance}%`}
          subtitle="Campus-wide average"
          href="/attendance"
          progress={stats.campusAttendance}
          progressClass="bg-emerald-500"
          accent="bg-emerald-500/20"
          delay={0.15}
        />
        <KpiCard
          icon={FileText}
          title="Assignments"
          value={String(stats.assignmentCount)}
          subtitle="Posted for students"
          badge={`${stats.submissionRate}% submitted`}
          href="/tasks"
          progress={stats.submissionRate}
          progressClass="bg-brand"
          accent="bg-sky-500/20"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Classes" value={String(stats.classCount)} href="/timetable" />
        <MiniStat label="Notices" value={String(stats.noticeCount)} href="/notices" />
        <MiniStat label="Pending fees" value={String(stats.pendingPayments)} href="/payments" />
        <MiniStat label="Open tickets" value={String(stats.openTickets)} href="/housing" />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {data.enrollmentTrend && data.enrollmentTrend.length > 0 && (
          <EnrollmentAreaChart data={data.enrollmentTrend} />
        )}
        {data.teacherStatus && (
          <TeacherDonutChart data={data.teacherStatus} />
        )}
      </div>

      {data.assignmentAnalytics && data.assignmentAnalytics.length > 0 && (
        <AssignmentStackedChart data={data.assignmentAnalytics} />
      )}

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-brand" />
              <h3 className="text-[15px] font-bold text-heading">Recent Student Activity</h3>
            </div>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Latest registrations and assignment submissions</p>
          </div>
          <Link href="/students" className="text-xs font-semibold text-brand hover:underline shrink-0">
            View all students →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Branch</th>
                <th className="px-5 py-3 font-semibold">Assignments</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No students registered yet
                  </td>
                </tr>
              ) : (
                data.recentStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => router.push('/students')}
                  >
                    <td className="px-5 py-3.5">
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
                    <td className="px-5 py-3.5 text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.branch || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-brand-muted px-2.5 py-1 text-xs font-bold text-brand">
                        {s.submissions}/{s.assignmentsTotal} submitted
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
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
