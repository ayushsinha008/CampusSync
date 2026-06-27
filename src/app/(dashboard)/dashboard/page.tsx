'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboard } from '@/components/AdminDashboard';
import {
  Tag, BarChart2, BookOpen, ExternalLink, MoreHorizontal, User, MapPin, Layers,
} from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Legend,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import type { GpaChartPoint } from '@/lib/student-grades';
import Link from 'next/link';

type ScheduleItem = {
  name: string;
  time: string;
  lecturer: string;
  room: string;
  credits: string;
  avatar: string;
};

type PaymentRow = {
  _id: string;
  description: string;
  date: string;
  status: string;
};

function Panel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl shadow-[0_1px_4px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; payload: { label: string } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#FFFDF8] p-4 border border-amber-100/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-w-[170px]">
      <p className="text-[12px] font-bold text-slate-800 mb-3">{data.label} 2025</p>
      <div className="flex flex-col gap-2.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-[11px] gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500 font-medium">
                {entry.name === 'yourGPA' ? 'Your GPA' : 'Average GPA'}
              </span>
            </div>
            <span className="font-extrabold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  total,
  subtitle,
  badge,
  badgeVariant,
}: {
  icon: typeof Tag;
  title: string;
  value: string;
  total: string;
  subtitle: string;
  badge: string;
  badgeVariant: 'positive' | 'negative';
}) {
  return (
    <Panel className="p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEEAFD]">
            <Icon className="h-4 w-4 text-[#5B4FCF]" strokeWidth={2.2} />
          </div>
          <span className="text-[13px] font-bold text-[#1E293B]">{title}</span>
        </div>
        <MoreHorizontal className="h-4 w-4 text-slate-300" />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[38px] sm:text-[42px] font-extrabold text-[#1E293B] leading-none tracking-tight">{value}</span>
        {total ? <span className="text-lg text-slate-400 font-medium">/{total}</span> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 text-[10px] font-medium">
        <span className="text-slate-400">{subtitle}</span>
        <span
          className={
            badgeVariant === 'positive'
              ? 'bg-[#E8F8EF] text-emerald-600 px-2.5 py-0.5 rounded-full whitespace-nowrap'
              : 'bg-[#FEE8EC] text-rose-500 px-2.5 py-0.5 rounded-full whitespace-nowrap'
          }
        >
          {badge}
        </span>
      </div>
    </Panel>
  );
}

function ScheduleCard({
  name, time, lecturer, room, credits, avatar,
}: {
  name: string; time: string; lecturer: string; room: string; credits: string; avatar: string;
}) {
  return (
    <div className="border border-slate-100 rounded-xl p-3 relative bg-white">
      <ExternalLink className="absolute top-3 right-3 h-3.5 w-3.5 text-slate-300" />
      <div className="flex items-center gap-3 pr-4 mb-3">
        <img src={avatar} alt={lecturer} className="h-10 w-10 rounded-full object-cover shrink-0" />
        <div className="min-w-0">
          <h4 className="text-[13px] font-semibold text-[#1E293B] truncate">{name}</h4>
          <p className="text-[11px] text-slate-400">{time}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-400"><User className="h-3 w-3" /> Lecturer</span>
        <span className="text-right text-slate-700 font-medium truncate">{lecturer}</span>
        <span className="flex items-center gap-1.5 text-slate-400"><MapPin className="h-3 w-3" /> Course Room</span>
        <span className="text-right text-slate-700 font-medium">{room}</span>
        <span className="flex items-center gap-1.5 text-slate-400"><BookOpen className="h-3 w-3" /> Course Credits</span>
        <span className="text-right text-slate-700 font-medium">{credits}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState<GpaChartPoint[]>([]);
  const [gpaStats, setGpaStats] = useState<{ cumulativeGpa?: string } | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/dashboard').then((res) => res.json()),
        fetch('/api/grades').then((res) => res.json()),
        fetch('/api/payments').then((res) => res.json()),
      ])
        .then(([dashboardJson, gradesJson, paymentsJson]) => {
          if (!dashboardJson.message) setData(dashboardJson);
          if (!gradesJson.message) {
            setChartData(gradesJson.chartData || []);
            setGpaStats(gradesJson.stats || null);
          }
          if (!paymentsJson.message) setPayments(paymentsJson.payments || []);
        })
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-5 w-full">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-[148px] rounded-2xl" />
          <Skeleton className="h-[148px] rounded-2xl" />
          <Skeleton className="h-[148px] rounded-2xl sm:col-span-2 xl:col-span-1" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <Skeleton className="h-[280px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const role = (session?.user as { role?: string })?.role || 'student';

  if (role === 'staff') {
    return <AdminDashboard />;
  }

  const scheduleItems: ScheduleItem[] = data?.todaySchedule?.length
    ? data.todaySchedule.map((cls: { startTime: string; endTime: string; subjectId?: { name?: string; faculty?: string; room?: string } }) => ({
        name: cls.subjectId?.name || 'Class',
        time: `${cls.startTime} - ${cls.endTime}`,
        lecturer: cls.subjectId?.faculty || 'TBD',
        room: cls.subjectId?.room || 'TBD',
        credits: '4 Credits',
        avatar: `https://i.pravatar.cc/150?u=${cls.subjectId?.name || 'class'}`,
      }))
    : [];

  return (
    <div className="w-full space-y-5">
      {/* Stats row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Tag} title="Pending Assignments" value={String(data?.stats?.assignmentsPending ?? 0)} total="" subtitle="Not yet submitted" badge="From teacher" badgeVariant="positive" />
        <StatCard icon={BarChart2} title="Attendance" value={String(data?.stats?.attendancePercentage ?? 0)} total="100" subtitle="Overall attendance rate" badge="Live from DB" badgeVariant="positive" />
        <StatCard icon={Layers} title="Active Class" value={String(data?.stats?.activeSubjects ?? 0)} total="" subtitle="Enrolled subjects" badge={`${data?.stats?.upcomingClasses ?? 0} today`} badgeVariant="positive" />
      </div>

      {/* Main grid: chart + payment left, schedule right */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="space-y-5 min-w-0">
          {/* GPA Chart */}
          <Panel>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-5 pb-2">
              <div>
                <h3 className="text-[15px] font-bold text-[#1E293B]">Grade Point Average</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {gpaStats?.cumulativeGpa && Number(gpaStats.cumulativeGpa) > 0
                    ? `Cumulative GPA: ${gpaStats.cumulativeGpa}`
                    : 'No grades recorded yet'}
                </p>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="px-5 pb-8 pt-2 text-center">
                <p className="text-sm text-slate-500">Grades will appear here once your courses are published.</p>
                <Link href="/grades" className="mt-2 inline-block text-xs font-semibold text-[#5B4FCF] hover:underline">
                  Go to Grades →
                </Link>
              </div>
            ) : (
              <div className="px-3 sm:px-5 pb-5 h-[260px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="colorYourGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="shortLabel"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      domain={[1.0, 4.0]}
                      ticks={[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]}
                      width={28}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="line"
                      iconSize={12}
                      wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                      formatter={(value) => (value === 'yourGPA' ? 'Your GPA' : 'Average GPA')}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                    <Line
                      type="monotone"
                      dataKey="avgGPA"
                      name="avgGPA"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#f43f5e', strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="yourGPA"
                      name="yourGPA"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fill="url(#colorYourGpa)"
                      dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 2, fill: '#8b5cf6', stroke: '#fff' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Payment table */}
          <Panel>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-5 pb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1E293B]">Payment & Tuition History</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Your payment records from the database</p>
              </div>
              <Link href="/payments" className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 shrink-0">
                View All Payment
              </Link>
            </div>
            <div className="px-5 pb-5 overflow-x-auto">
              {payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No payment records yet.</p>
              ) : (
                <table className="w-full text-[13px] text-left min-w-[560px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="pb-2.5 font-medium pr-4">Payment ID</th>
                      <th className="pb-2.5 font-medium pr-4">Payment Category</th>
                      <th className="pb-2.5 font-medium pr-4">Date</th>
                      <th className="pb-2.5 font-medium pr-4">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.slice(0, 5).map((row) => (
                      <tr key={row._id}>
                        <td className="py-3 pr-4 text-slate-500 font-medium whitespace-nowrap">{row._id.slice(-8).toUpperCase()}</td>
                        <td className="py-3 pr-4 text-[#1E293B] font-semibold">{row.description}</td>
                        <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="py-3 pr-4">
                          <span className={row.status === 'Pending'
                            ? 'bg-amber-100 text-amber-600 px-3 py-1 rounded-md font-medium text-xs'
                            : 'bg-emerald-100 text-emerald-600 px-3 py-1 rounded-md font-medium text-xs'}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>
        </div>

        {/* Daily Class Schedule */}
        <Panel className="xl:sticky xl:top-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-5 pb-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1E293B]">Daily Class Schedule</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Today&apos;s classes from timetable</p>
            </div>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-2.5">
            {scheduleItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No classes scheduled for today.</p>
            ) : (
              scheduleItems.map((item) => (
                <ScheduleCard key={item.name + item.time} {...item} />
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
