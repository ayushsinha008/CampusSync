'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Mail, BookOpen, Users, ClipboardList,
  CheckCircle2, Clock, XCircle, ShieldCheck,
} from 'lucide-react';

type TeacherDetail = {
  teacher: {
    _id: string;
    name: string;
    email?: string;
    department: string;
    status: 'Present' | 'On Leave' | 'Absent';
    subjects: string[];
    createdAt: string;
    publicFacultyUrl: string;
  };
  subjects: Array<{ _id: string; name: string; room?: string; faculty?: string }>;
  students: Array<{ _id: string; name: string; email: string; rollNumber?: string; branch?: string }>;
  assignments: Array<{ title: string; subject: string; dueDate: string; priority: string }>;
  stats: { subjectCount: number; studentCount: number; assignmentCount: number; campusAttendancePct: number };
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

export default function TeacherDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const teacherId = String(params.id || '');

  const [detail, setDetail] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [teacherId]);

  useEffect(() => {
    if (status === 'loading' || !teacherId) return;
    if (!isStaff) {
      router.replace('/dashboard');
      return;
    }

    setLoading(true);
    setError('');
    fetch(`/api/staff/teachers/${teacherId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load teacher');
        setDetail(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load teacher'))
      .finally(() => setLoading(false));
  }, [status, isStaff, router, teacherId]);

  const updateStatus = async (newStatus: 'Present' | 'On Leave' | 'Absent') => {
    setUpdatingStatus(true);
    const res = await fetch(`/api/staff/teachers/${teacherId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setDetail((prev) =>
        prev ? { ...prev, teacher: { ...prev.teacher, status: data.teacher.status } } : prev
      );
    }
    setUpdatingStatus(false);
  };

  if (status === 'loading' || loading) {
    return <Skeleton className="h-[600px] rounded-2xl" />;
  }

  if (!isStaff) return null;

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-12">
        <Link
          href="/teachers"
          className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold text-[#5B4FCF] hover:bg-[#EEEAFD] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all teachers
        </Link>
        <Panel className="p-8 text-center">
          <p className="text-slate-600 font-medium">{error || 'Teacher not found'}</p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <Link
        href="/teachers"
        className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-bold text-[#5B4FCF] hover:bg-[#EEEAFD] transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all teachers
      </Link>

      <Panel className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-[#1C1A3A] via-[#2D2B52] to-[#5B4FCF] px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] text-3xl font-bold">
                {detail.teacher.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left text-white flex-1">
              <h1 className="text-2xl font-bold">{detail.teacher.name}</h1>
              <p className="mt-1 text-white/80 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-4 w-4" /> {detail.teacher.email || '—'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge className="bg-white text-[#5B4FCF] border-0">Faculty</Badge>
                <Badge className="bg-white/15 text-white border-0">{detail.teacher.department}</Badge>
                <Badge className={statusBadgeClass(detail.teacher.status)}>{detail.teacher.status}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-t border-slate-100">
          {[
            { label: 'Subjects', value: String(detail.stats.subjectCount) },
            { label: 'Students', value: String(detail.stats.studentCount) },
            { label: 'Assignments', value: String(detail.stats.assignmentCount) },
            { label: 'Class Attendance', value: `${detail.stats.campusAttendancePct}%` },
          ].map((item) => (
            <div key={item.label} className="px-4 py-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-[#1E293B]">{item.value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <Panel className="p-5">
            <h3 className="text-[15px] font-bold text-[#1E293B] mb-4">Update Attendance Status</h3>
            <div className="flex flex-wrap gap-2">
              {(['Present', 'On Leave', 'Absent'] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={detail.teacher.status === s ? 'default' : 'outline'}
                  disabled={updatingStatus}
                  className={
                    detail.teacher.status === s
                      ? 'bg-[#5B4FCF] hover:bg-[#4B3FBF]'
                      : 'border-slate-200'
                  }
                  onClick={() => updateStatus(s)}
                >
                  {s === 'Present' && <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                  {s === 'On Leave' && <Clock className="mr-1.5 h-4 w-4" />}
                  {s === 'Absent' && <XCircle className="mr-1.5 h-4 w-4" />}
                  {s}
                </Button>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#5B4FCF]" /> Subjects Teaching
            </h3>
            {detail.subjects.length === 0 ? (
              <p className="text-sm text-slate-400">No subjects assigned</p>
            ) : (
              <ul className="space-y-2">
                {detail.subjects.map((s) => (
                  <li key={s._id} className="rounded-xl bg-[#F5F6FA] px-4 py-3 flex justify-between">
                    <span className="font-semibold text-sm text-[#1E293B]">{s.name}</span>
                    <span className="text-xs text-slate-400">{s.room || 'Room TBD'}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-5">
            <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#5B4FCF]" /> Recent Assignments
            </h3>
            {detail.assignments.length === 0 ? (
              <p className="text-sm text-slate-400">No assignments posted</p>
            ) : (
              <ul className="space-y-2">
                {detail.assignments.map((a) => (
                  <li key={a.title + a.subject} className="rounded-xl bg-[#F5F6FA] px-4 py-3">
                    <p className="font-semibold text-sm text-[#1E293B]">{a.title}</p>
                    <p className="text-xs text-slate-400">{a.subject} · {a.priority}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-5">
            <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#5B4FCF]" /> Enrolled Students
            </h3>
            {detail.students.length === 0 ? (
              <p className="text-sm text-slate-400">No students enrolled in their subjects</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {detail.students.map((s) => (
                  <li key={s._id} className="flex items-center gap-3 py-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] text-xs font-bold">
                        {s.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-[#1E293B] truncate">{s.name}</p>
                      <p className="text-xs text-slate-400 truncate">{s.rollNumber || s.email}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{s.branch || '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel className="p-5 h-fit lg:sticky lg:top-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#5B4FCF]/10">
              <ShieldCheck className="h-5 w-5 text-[#5B4FCF]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#1E293B]">Faculty ID QR</h3>
            <p className="text-xs text-[#5B4FCF] font-medium mt-1">Scan at campus gate</p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 inline-block">
              <QRCode value={detail.teacher.publicFacultyUrl} size={180} level="M" />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Joined {format(new Date(detail.teacher.createdAt), 'dd MMM yyyy')}
            </p>
            <Link
              href={detail.teacher.publicFacultyUrl}
              target="_blank"
              className="mt-3 inline-block text-xs font-semibold text-[#5B4FCF] hover:underline"
            >
              Open faculty pass →
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
