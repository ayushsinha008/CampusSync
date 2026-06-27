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
import { buildGpaChartData, DEMO_GRADE_ROWS } from '@/lib/student-grades';

const chartData = buildGpaChartData(DEMO_GRADE_ROWS);

const DEMO_SCHEDULE = [
  {
    name: 'Logics & Algebra',
    time: '08.30 AM - 09.30 AM',
    lecturer: 'Endang Setyowati, Ph.D',
    room: 'HCI - 401',
    credits: '4 Credits',
    avatar: 'https://i.pravatar.cc/150?u=b',
  },
  {
    name: 'Risk Management System',
    time: '09.30 AM - 01.30 PM',
    lecturer: 'Dadang Nurjaman, Ph.D',
    room: 'HCI - 303',
    credits: '4 Credits',
    avatar: 'https://i.pravatar.cc/150?u=c',
  },
  {
    name: 'Networking & Engineering',
    time: '01.30 PM - 03.30 PM',
    lecturer: 'Jusuf Pariaman, Ph.D',
    room: 'HCI - 401',
    credits: '4 Credits',
    avatar: 'https://i.pravatar.cc/150?u=d',
  },
];

const PAYMENTS = [
  { id: 'PID - 331829', category: '6th Semester Tuition', date: '23 October 2024', status: 'On-Verification' as const },
  { id: 'PID - 331828', category: 'Internship Program 2025', date: '24 August 2024', status: 'Completed' as const },
  { id: 'PID - 331827', category: '5th Semester Tuition', date: '20 May 2024', status: 'Completed' as const },
];

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then((res) => res.json())
        .then((json) => {
          if (!json.message) setData(json);
          setLoading(false);
        })
        .catch(() => setLoading(false));
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

  const scheduleItems = data?.todaySchedule?.length
    ? data.todaySchedule.map((cls: { startTime: string; endTime: string; subjectId?: { name?: string; faculty?: string; room?: string } }) => ({
        name: cls.subjectId?.name || 'Class',
        time: `${cls.startTime} - ${cls.endTime}`,
        lecturer: cls.subjectId?.faculty || 'TBD',
        room: cls.subjectId?.room || 'TBD',
        credits: '4 Credits',
        avatar: `https://i.pravatar.cc/150?u=${cls.subjectId?.name || 'class'}`,
      }))
    : DEMO_SCHEDULE;

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
                <p className="text-[11px] text-slate-400 mt-0.5">Comparison between your GPA and Average Student GPA</p>
              </div>
              <select className="text-[11px] border border-slate-200 rounded-lg bg-[#F5F6FA] py-1.5 px-3 text-slate-700 font-medium outline-none cursor-pointer shrink-0">
                <option>All Semesters</option>
              </select>
            </div>
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
          </Panel>

          {/* Payment table */}
          <Panel>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-5 pb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1E293B]">Payment & Tuition History</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Complete data about your payment and tuition history</p>
              </div>
              <button type="button" className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 shrink-0">
                View All Payment
              </button>
            </div>
            <div className="px-5 pb-5 overflow-x-auto">
              <table className="w-full text-[13px] text-left min-w-[560px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-2.5 font-medium pr-4">Payment ID</th>
                    <th className="pb-2.5 font-medium pr-4">Payment Category</th>
                    <th className="pb-2.5 font-medium pr-4">Date</th>
                    <th className="pb-2.5 font-medium pr-4">Payment Status</th>
                    <th className="pb-2.5 font-medium text-center w-10">...</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {PAYMENTS.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 text-slate-500 font-medium whitespace-nowrap">{row.id}</td>
                      <td className="py-3 pr-4 text-[#1E293B] font-semibold">{row.category}</td>
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{row.date}</td>
                      <td className="py-3 pr-4">
                        <span className={row.status === 'On-Verification'
                          ? 'bg-amber-100 text-amber-600 px-3 py-1 rounded-md font-medium text-xs'
                          : 'bg-emerald-100 text-emerald-600 px-3 py-1 rounded-md font-medium text-xs'}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 inline-block cursor-pointer hover:text-slate-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Daily Class Schedule */}
        <Panel className="xl:sticky xl:top-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-5 pb-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1E293B]">Daily Class Schedule</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Schedule for your class in weekly & daily</p>
            </div>
            <select className="text-[11px] border border-slate-200 rounded-lg bg-[#F5F6FA] py-1.5 px-3 text-slate-600 outline-none cursor-pointer shrink-0">
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-2.5">
            {scheduleItems.map((item: typeof DEMO_SCHEDULE[0]) => (
              <ScheduleCard key={item.name + item.time} {...item} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
