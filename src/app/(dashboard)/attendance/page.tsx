'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, X } from 'lucide-react';

interface SubjectRow {
  _id: string;
  name: string;
  faculty?: string;
  room?: string;
  attendance: number;
  totalClasses: number;
}

interface StudentOption {
  _id: string;
  name: string;
  email: string;
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async (studentId?: string) => {
    try {
      if (isStaff && studentId) {
        const res = await fetch(`/api/staff/students/${studentId}`);
        const data = await res.json();
        setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      } else {
        const res = await fetch('/api/subjects');
        const data = await res.json();
        setSubjects(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    const res = await fetch('/api/staff/students');
    const data = await res.json();
    if (Array.isArray(data)) {
      setStudents(data);
      if (data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0]._id);
      }
    }
  };

  useEffect(() => {
    if (isStaff) {
      fetchStudents();
    } else {
      fetchSubjects();
    }
  }, [isStaff]);

  useEffect(() => {
    if (isStaff && selectedStudent) {
      setLoading(true);
      fetchSubjects(selectedStudent);
    }
  }, [isStaff, selectedStudent]);

  const markAttendance = async (subjectId: string, status: 'present' | 'absent') => {
    if (isStaff && !selectedStudent) {
      toast.error('Please select a student first');
      return;
    }
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          status,
          ...(isStaff ? { studentId: selectedStudent } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Marked as ${status}`);
        fetchSubjects(isStaff ? selectedStudent : undefined);
      } else {
        toast.error(data.message || 'Failed to mark attendance');
      }
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const chartData = subjects.map((s) => ({
    name: s.name,
    percentage: s.totalClasses === 0 ? 0 : Math.round((s.attendance / s.totalClasses) * 100),
  }));

  if (loading) return <div>Loading attendance data...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Attendance Tracker</h1>
          <p className="text-muted-foreground mt-1">
            {isStaff ? 'Mark and review attendance for each student.' : 'Track your subject attendance.'}
          </p>
        </div>
        {isStaff && students.length > 0 && (
          <Select value={selectedStudent} onValueChange={(v) => v && setSelectedStudent(v)}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Attendance Analytics</h2>
              <div className="h-[300px]">
                {subjects.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="percentage" fill="#5B4FCF" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No subjects found. Staff can add subjects in Class Schedule.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{isStaff ? 'Mark Attendance' : 'Your Subjects'}</h2>
          {subjects.map((subject) => {
            const percentage =
              subject.totalClasses === 0
                ? 0
                : Math.round((subject.attendance / subject.totalClasses) * 100);

            return (
              <Card key={subject._id} className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {subject.attendance} / {subject.totalClasses} classes attended
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${percentage < 75 ? 'text-destructive' : 'text-emerald-500'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2 mb-4" />
                  {isStaff && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-emerald-600 hover:bg-emerald-50"
                        onClick={() => markAttendance(subject._id, 'present')}
                      >
                        <Check className="mr-1 h-4 w-4" /> Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:bg-destructive/10"
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
