'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import {
  ArrowLeft, Mail, GraduationCap, Building2, Hash,
  Award, BookOpen, Home, IndianRupee, FileText, ShieldCheck, Search,
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { StudentSectionCharts } from '@/components/admin/SectionChartBlocks';

type StudentRow = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  rollNumber?: string;
  branch?: string;
  semester?: number;
  createdAt: string;
  stats: { attendancePercentage: number; taskCount: number; noteCount: number };
};

type StudentDetail = {
  student: {
    _id: string; name: string; email: string; image: string | null;
    rollNumber?: string; branch?: string; semester?: number; createdAt: string;
    publicEntryUrl: string | null;
    qrReady?: boolean;
  };
  attendance: {
    percentage: number; attended: number; totalClasses: number;
    subjects: Array<{ name: string; faculty?: string; attendance: number; totalClasses: number }>;
  };
  gradeStats: { termGpa: string; cumulativeGpa: string; earnedCredits: number; standing: string };
  grades: Array<{ courseCode: string; courseName: string; credits: number; grade: string; semester: string; status: string }>;
  assignments: Array<{ title: string; subject: string; submitted: boolean; submittedAt: string | null; priority: string }>;
  submissionsCount: number;
  assignmentsTotal: number;
  certificates: Array<{ title: string; issuer: string; awardedDate: string }>;
  housing: { building: string; room: string; status: string; roommateName?: string } | null;
  payments: Array<{ description: string; amount: number; status: string; date: string }>;
  financialAid: Array<{ name: string; amount: number; type: string; status: string }>;
};

function Panel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-50 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-[#1E293B] text-right">{value}</span>
    </div>
  );
}

export default function StudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');

  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  useEffect(() => {
    if (status === 'loading') return;
    if (!isStaff) {
      router.replace('/dashboard');
      return;
    }
    fetch('/api/staff/students')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudents(data);
      })
      .finally(() => setLoading(false));
  }, [status, isStaff, router]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    fetch(`/api/staff/students/${selectedId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) setDetail(data);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q) ||
      (s.branch || '').toLowerCase().includes(q)
    );
  });

  if (status === 'loading' || loading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  if (!isStaff) return null;

  if (selectedId) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-12">
        <Button variant="ghost" className="text-[#5B4FCF] hover:bg-[#EEEAFD]" onClick={() => setSelectedId(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all students
        </Button>

        {detailLoading || !detail ? (
          <Skeleton className="h-[600px] rounded-2xl" />
        ) : (
          <>
            <Panel className="overflow-hidden p-0">
              <div className="bg-gradient-to-br from-[#1C1A3A] via-[#2D2B52] to-[#5B4FCF] px-6 py-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={detail.student.image || undefined} alt={detail.student.name} />
                    <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] text-3xl font-bold">
                      {detail.student.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left text-white">
                    <h1 className="text-2xl font-bold">{detail.student.name}</h1>
                    <p className="mt-1 text-white/80 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                      <Mail className="h-4 w-4" /> {detail.student.email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge className="bg-white text-[#5B4FCF] border-0">Student</Badge>
                      <Badge className="bg-white/15 text-white border-0">{detail.student.rollNumber}</Badge>
                      <Badge className="bg-white/15 text-white border-0">{detail.student.branch}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-t border-slate-100">
                {[
                  { label: 'CGPA', value: detail.gradeStats.cumulativeGpa },
                  { label: 'Term GPA', value: detail.gradeStats.termGpa },
                  { label: 'Attendance', value: `${detail.attendance.percentage}%` },
                  { label: 'Assignments', value: `${detail.submissionsCount}/${detail.assignmentsTotal}` },
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
                  <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#5B4FCF]" /> Basic Details
                  </h3>
                  <DetailRow label="Roll Number" value={detail.student.rollNumber || '—'} />
                  <DetailRow label="Branch" value={detail.student.branch || '—'} />
                  <DetailRow label="Semester" value={detail.student.semester ? `Semester ${detail.student.semester}` : '—'} />
                  <DetailRow label="Academic Standing" value={detail.gradeStats.standing} />
                  <DetailRow label="Earned Credits" value={String(detail.gradeStats.earnedCredits)} />
                  <DetailRow label="Joined" value={format(new Date(detail.student.createdAt), 'dd MMM yyyy')} />
                </Panel>

                <Panel className="p-5">
                  <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#5B4FCF]" /> Attendance by Subject
                  </h3>
                  {detail.attendance.subjects.length === 0 ? (
                    <p className="text-sm text-slate-400">No attendance records</p>
                  ) : (
                    <ul className="space-y-3">
                      {detail.attendance.subjects.map((s) => {
                        const pct = s.totalClasses > 0 ? Math.round((s.attendance / s.totalClasses) * 100) : 0;
                        return (
                        <li key={s.name} className="rounded-xl bg-[#F5F6FA] px-4 py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-[#1E293B]">{s.name}</p>
                              <p className="text-xs text-slate-400">{s.faculty || 'Faculty TBD'}</p>
                            </div>
                            <span className="text-lg font-bold text-[#5B4FCF]">{pct}%</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{s.attendance}/{s.totalClasses} classes attended</p>
                        </li>
                        );
                      })}
                    </ul>
                  )}
                </Panel>

                <Panel className="p-5">
                  <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#5B4FCF]" /> Grades
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 text-left border-b border-slate-100">
                          <th className="pb-2 font-medium">Code</th>
                          <th className="pb-2 font-medium">Course</th>
                          <th className="pb-2 font-medium text-center">Credits</th>
                          <th className="pb-2 font-medium text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {detail.grades.map((g) => (
                          <tr key={g.courseCode + g.semester}>
                            <td className="py-2.5 text-slate-600">{g.courseCode}</td>
                            <td className="py-2.5 font-medium text-[#1E293B]">{g.courseName}</td>
                            <td className="py-2.5 text-center">{g.credits}</td>
                            <td className="py-2.5 text-center font-bold">{g.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                <Panel className="p-5">
                  <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#5B4FCF]" /> Assignments
                  </h3>
                  <ul className="space-y-2">
                    {detail.assignments.map((a) => (
                      <li key={a.title} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1E293B]">{a.title}</p>
                          <p className="text-xs text-slate-400">{a.subject}</p>
                        </div>
                        <Badge className={a.submitted ? 'bg-emerald-50 text-emerald-700 border-0' : 'bg-amber-50 text-amber-700 border-0'}>
                          {a.submitted ? 'Submitted' : 'Pending'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Panel>

                {detail.housing && (
                  <Panel className="p-5">
                    <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                      <Home className="h-4 w-4 text-[#5B4FCF]" /> Housing
                    </h3>
                    <DetailRow label="Building" value={detail.housing.building} />
                    <DetailRow label="Room" value={detail.housing.room} />
                    <DetailRow label="Status" value={detail.housing.status} />
                    {detail.housing.roommateName && (
                      <DetailRow label="Roommate" value={detail.housing.roommateName} />
                    )}
                  </Panel>
                )}

                {detail.payments.length > 0 && (
                  <Panel className="p-5">
                    <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-[#5B4FCF]" /> Payments
                    </h3>
                    {detail.payments.map((p) => (
                      <DetailRow key={p.description + p.date} label={p.description} value={`${formatINR(p.amount)} · ${p.status}`} />
                    ))}
                  </Panel>
                )}
              </div>

              <Panel className="p-5 h-fit lg:sticky lg:top-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#5B4FCF]/10">
                    <ShieldCheck className="h-5 w-5 text-[#5B4FCF]" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#1E293B]">College Entry QR</h3>
                  {detail.student.qrReady && detail.student.publicEntryUrl ? (
                    <>
                      <p className="text-xs text-[#5B4FCF] font-medium mt-1">Scan at campus gate</p>
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 inline-block">
                        <QRCode value={detail.student.publicEntryUrl} size={180} level="M" />
                      </div>
                      <p className="mt-3 font-mono text-[11px] text-slate-400">{detail.student.rollNumber}</p>
                      <Link
                        href={detail.student.publicEntryUrl}
                        target="_blank"
                        className="mt-3 inline-block text-xs font-semibold text-[#5B4FCF] hover:underline"
                      >
                        Open entry pass page →
                      </Link>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed px-2">
                      QR not generated yet — student must complete roll number, branch and semester in profile.
                    </p>
                  )}
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">All Students</h1>
        <p className="mt-1 text-sm text-slate-500">Tap any student to view full profile, attendance, CGPA & QR pass</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search by name, email, roll or branch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/20"
        />
      </div>

      <Panel className="divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-400 text-sm">No students found</p>
        ) : (
          filtered.map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => setSelectedId(s._id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F5F6FA] transition-colors"
            >
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm shrink-0">
                <AvatarImage src={s.image || undefined} alt={s.name} />
                <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] font-bold">
                  {s.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#1E293B] truncate">{s.name}</p>
                <p className="text-xs text-slate-500 truncate">{s.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1"><Hash className="h-3 w-3" />{s.rollNumber || '—'}</span>
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{s.branch || '—'}</span>
                  <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" />Sem {s.semester || '—'}</span>
                </div>
              </div>
              <div className="shrink-0 text-right hidden sm:block">
                <p className="text-sm font-bold text-[#5B4FCF]">{s.stats.attendancePercentage}%</p>
                <p className="text-[10px] text-slate-400">attendance</p>
              </div>
            </button>
          ))
        )}
      </Panel>

      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B]">Student Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Enrollment trends, branch distribution & semester breakdown</p>
        </div>
        <StudentSectionCharts />
      </div>
    </div>
  );
}
