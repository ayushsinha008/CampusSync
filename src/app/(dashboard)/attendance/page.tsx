'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, X } from 'lucide-react';

export default function AttendancePage() {
  const { data: session } = useSession();
  const isStaff = (session?.user as any)?.role === 'staff';
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const markAttendance = async (subjectId: string, status: 'present' | 'absent') => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, status })
      });
      if (res.ok) {
        toast.success(`Marked as ${status}`);
        fetchSubjects();
      }
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const chartData = subjects.map(s => ({
    name: s.name,
    percentage: s.totalClasses === 0 ? 0 : Math.round((s.attendance / s.totalClasses) * 100)
  }));

  if (loading) return <div>Loading attendance data...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Attendance Tracker</h1>
        <p className="text-muted-foreground mt-1">Manage and track your subject attendance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
              <CardDescription>Your attendance percentage across all subjects</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {subjects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="percentage" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No subjects found. Add subjects in Timetable first.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mark Attendance</h2>
          {subjects.length === 0 && (
            <div className="text-sm text-muted-foreground">No subjects available to mark.</div>
          )}
          {subjects.map(subject => {
            const percentage = subject.totalClasses === 0 
              ? 0 
              : Math.round((subject.attendance / subject.totalClasses) * 100);
            
            return (
              <Card key={subject._id} className="rounded-2xl border-none shadow-sm mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {subject.attendance} / {subject.totalClasses} classes attended
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${percentage < 75 ? 'text-destructive' : 'text-emerald-500'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2 mb-4" />
                  {isStaff && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => markAttendance(subject._id, 'present')}
                      >
                        <Check className="mr-1 h-4 w-4" /> Present
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => markAttendance(subject._id, 'absent')}
                      >
                        <X className="mr-1 h-4 w-4" /> Absent
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
