'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, BookOpen, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Legend,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import { computeStats, type GpaChartPoint } from '@/lib/student-grades';
import { useChartTheme } from '@/hooks/useChartTheme';

type GradeRow = {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  semester: string;
  status: string;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload: { label: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card p-4 border border-border rounded-xl shadow-lg min-w-[170px]">
      <p className="text-xs font-bold text-foreground mb-3">{data.label}</p>
      <div className="flex flex-col gap-2.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-[11px] gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground font-medium">
                {entry.name === 'yourGPA' ? 'Your GPA' : 'Average GPA'}
              </span>
            </div>
            <span className="font-extrabold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [chartData, setChartData] = useState<GpaChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { axis } = useChartTheme();

  useEffect(() => {
    fetch('/api/grades')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setGrades(data.grades);
        setSemesters(data.semesters);
        setSelectedSemester(data.semesters[0] || '');
        setChartData(data.chartData || []);
      })
      .catch(() => toast.error('Failed to load grades'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => computeStats(grades, selectedSemester || undefined),
    [grades, selectedSemester]
  );

  const filtered = grades.filter((g) => !selectedSemester || g.semester === selectedSemester);

  if (loading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-heading tracking-tight">Grades & Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your academic progress and course grades.</p>
        </div>
        {semesters.length > 0 && (
          <Select value={selectedSemester} onValueChange={(v) => v && setSelectedSemester(v)}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-border text-foreground">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400"><Award className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Term GPA</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.termGpa}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cumulative GPA</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.cumulativeGpa}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400"><BookOpen className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Earned Credits</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.earnedCredits}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400"><Star className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Academic Standing</p>
              <h3 className="text-lg font-bold text-foreground mt-1">{stats.standing}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border py-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Grade Point Average</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Comparison between your GPA and average student GPA</p>
            </div>
            <span className="text-xs border border-border rounded-lg bg-muted py-1.5 px-3 text-foreground font-medium">
              All Semesters
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-5 pb-5 pt-2">
          {chartData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No grades yet. Your GPA chart will appear when grades are added to your account.
            </p>
          ) : (
            <div className="h-[260px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="gradesYourGpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="shortLabel"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 10, fill: axis }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: axis }}
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
              <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
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
                fill="url(#gradesYourGpa)"
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: 'var(--card)' }}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#8b5cf6', stroke: 'var(--card)' }}
              />
            </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
          <CardTitle className="text-lg font-bold text-slate-800">{selectedSemester || 'All'} Grades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold">Course Code</TableHead>
                <TableHead className="font-semibold">Course Name</TableHead>
                <TableHead className="text-center font-semibold">Credits</TableHead>
                <TableHead className="text-center font-semibold">Grade</TableHead>
                <TableHead className="text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    No grades for this semester yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium text-slate-600">{course.courseCode}</TableCell>
                    <TableCell className="text-slate-800">{course.courseName}</TableCell>
                    <TableCell className="text-center text-slate-600">{course.credits}</TableCell>
                    <TableCell className="text-center font-bold text-slate-800">{course.grade}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{course.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
