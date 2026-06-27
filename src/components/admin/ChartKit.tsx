'use client';

import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line,
} from 'recharts';

const PURPLE = '#5B4FCF';
const PURPLE_LIGHT = '#8B7FE8';
const ROSE = '#F43F5E';
const EMERALD = '#10B981';
const AMBER = '#F59E0B';
const SKY = '#0EA5E9';
const SLATE = '#94A3B8';
const CHART_COLORS = [PURPLE, SKY, EMERALD, ROSE, AMBER, PURPLE_LIGHT, '#EC4899', '#6366F1'];

const panelMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-bold text-heading mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-heading">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function ChartPanel({
  title,
  subtitle,
  children,
  className = '',
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      {...panelMotion}
      transition={{ ...panelMotion.transition, delay }}
      className={`bg-card rounded-2xl border border-border shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-5 pt-5 pb-1">
        <h3 className="text-[15px] font-bold text-heading">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-2 pb-4 pt-2">{children}</div>
    </motion.div>
  );
}

export function EnrollmentAreaChart({ data }: { data: Array<{ month: string; students: number }> }) {
  return (
    <ChartPanel title="Enrollment Trend" subtitle="New student registrations over time" delay={0}>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PURPLE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PURPLE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="students"
              name="Students"
              stroke={PURPLE}
              strokeWidth={3}
              fill="url(#enrollFill)"
              animationDuration={1400}
              animationEasing="ease-out"
              dot={{ r: 4, fill: PURPLE, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: ROSE }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export function BranchPieChart({ data }: { data: Array<{ branch: string; count: number }> }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <ChartPanel title="Students by Branch" subtitle="Enrollment distribution across departments" delay={0.1}>
      <div className="h-[220px] sm:h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="count"
              nameKey="branch"
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-heading">{total}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Total</p>
          </div>
        </div>
      </div>
    </ChartPanel>
  );
}

export function SemesterRadialChart({ data }: { data: Array<{ semester: string; count: number }> }) {
  const radialData = data.map((d, i) => ({
    name: d.semester,
    count: d.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  return (
    <ChartPanel title="Semester Strength" subtitle="Class-wise student count" delay={0.15}>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData} barSize={14}>
            <RadialBar
              background={{ fill: 'var(--chart-radial-bg)' }}
              dataKey="count"
              cornerRadius={8}
              animationDuration={1300}
              animationEasing="ease-out"
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export function TeacherDonutChart({ data }: { data: { present: number; onLeave: number; absent: number } }) {
  const pieData = [
    { name: 'Present', value: data.present, color: EMERALD },
    { name: 'On Leave', value: data.onLeave, color: AMBER },
    { name: 'Absent', value: data.absent, color: ROSE },
  ].filter((d) => d.value > 0);

  const total = data.present + data.onLeave + data.absent;

  return (
    <ChartPanel title="Faculty Attendance Today" subtitle="Present · On leave · Absent" delay={0}>
      <div className="h-[220px] sm:h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {pieData.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{data.present}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Present / {total}</p>
          </div>
        </div>
      </div>
    </ChartPanel>
  );
}

export function TeacherStatusBarChart({ teachers }: { teachers: Array<{ name: string; status: string }> }) {
  const chartData = teachers.map((t) => ({
    name: t.name.split(' ').slice(-1)[0] || t.name,
    fullName: t.name,
    score: t.status === 'Present' ? 100 : t.status === 'On Leave' ? 50 : 10,
    status: t.status,
  }));

  return (
    <ChartPanel title="Faculty Status Board" subtitle="Individual attendance status score" delay={0.1}>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--chart-grid)" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" width={56} tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload as { fullName: string; status: string };
                return (
                  <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg text-xs">
                    <p className="font-bold">{d.fullName}</p>
                    <p className="text-muted-foreground">{d.status}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="score" name="Status" radius={[0, 8, 8, 0]} barSize={16} animationDuration={1200}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.status === 'Present' ? EMERALD : entry.status === 'On Leave' ? AMBER : ROSE}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export function AttendanceRadarChart({ data }: { data: Array<{ subject: string; percentage: number }> }) {
  const radarData = data.map((d) => ({
    subject: d.subject,
    attendance: d.percentage,
  }));

  return (
    <ChartPanel title="Campus Attendance Radar" subtitle="Subject-wise attendance overview" delay={0}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="var(--chart-polar)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: SLATE }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: SLATE }} />
            <Radar
              name="Attendance %"
              dataKey="attendance"
              stroke={PURPLE}
              fill={PURPLE}
              fillOpacity={0.25}
              strokeWidth={2}
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Tooltip content={<ChartTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export function AttendanceLineChart({ data }: { data: Array<{ subject: string; percentage: number }> }) {
  return (
    <ChartPanel title="Attendance Trend by Subject" subtitle="Average % per course" delay={0.1}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EMERALD} stopOpacity={0.2} />
                <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="subject" tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<ChartTooltip />} formatter={(v) => [`${v}%`, 'Attendance']} />
            <Line
              type="monotone"
              dataKey="percentage"
              name="Attendance"
              stroke={EMERALD}
              strokeWidth={3}
              dot={{ r: 5, fill: EMERALD, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: PURPLE }}
              animationDuration={1300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export function AssignmentStackedChart({ data }: {
  data: Array<{ title: string; submitted: number; pending: number }>;
}) {
  return (
    <ChartPanel title="Submission Progress" subtitle="Submitted vs pending per assignment" delay={0}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--chart-grid)" />
            <XAxis type="number" tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="title" width={100} tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="submitted" name="Submitted" stackId="a" fill={PURPLE} radius={[0, 0, 0, 0]} barSize={18} animationDuration={1200} />
            <Bar dataKey="pending" name="Pending" stackId="a" fill="#E2E8F0" radius={[0, 6, 6, 0]} barSize={18} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}

export function SubmissionRateDonut({ rate, total }: { rate: number; total: number }) {
  const pieData = [
    { name: 'Submitted', value: rate, color: PURPLE },
    { name: 'Remaining', value: 100 - rate, color: '#E2E8F0' },
  ];

  return (
    <ChartPanel title="Overall Submission Rate" subtitle={`Across ${total} assignment(s)`} delay={0.1}>
      <div className="h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              animationDuration={1400}
              animationEasing="ease-out"
            >
              {pieData.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} formatter={(v) => [`${v}%`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-brand">{rate}%</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Submitted</p>
          </div>
        </div>
      </div>
    </ChartPanel>
  );
}

export function VerificationStatusDonut({
  title,
  subtitle,
  segments,
}: {
  title: string;
  subtitle?: string;
  segments: Array<{ name: string; value: number; color: string }>;
}) {
  const filtered = segments.filter((s) => s.value > 0);
  const total = segments.reduce((s, d) => s + d.value, 0);

  return (
    <ChartPanel title={title} subtitle={subtitle} delay={0}>
      <div className="h-[240px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              animationDuration={1200}
            >
              {filtered.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-heading">{total}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Total</p>
          </div>
        </div>
      </div>
    </ChartPanel>
  );
}

export function AssignmentPriorityChart({ data }: {
  data: Array<{ title: string; rate: number }>;
}) {
  return (
    <ChartPanel title="Completion Rate" subtitle="Per-assignment submission %" delay={0.15}>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="title" tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<ChartTooltip />} formatter={(v) => [`${v}%`, 'Rate']} />
            <Bar dataKey="rate" name="Rate" radius={[8, 8, 0, 0]} barSize={36} animationDuration={1200}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}
