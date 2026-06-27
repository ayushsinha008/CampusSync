'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, CheckCircle2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

type Term = {
  semester: string;
  gpa: number;
  credits: number;
  courses: { courseCode: string; courseName: string; credits: number; grade: string }[];
};

export default function TranscriptPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [cumulativeGpa, setCumulativeGpa] = useState('0.00');
  const [degree, setDegree] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transcript')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setTerms(data.terms);
        setCumulativeGpa(data.cumulativeGpa);
        setDegree(data.degree);
        setStudentName(data.student?.name || '');
      })
      .catch(() => toast.error('Failed to load transcript'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Transcript</h1>
          <p className="text-sm text-slate-500 mt-1">{studentName} — complete academic history from database.</p>
        </div>
        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shrink-0" onClick={() => toast.success('Official transcript request submitted. Email will be sent within 24 hours.')}>
          <Download className="mr-2 h-4 w-4" /> Request Official Transcript
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-[#1C1A3A] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-indigo-200 text-sm font-medium">Cumulative GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-5xl font-bold">{cumulativeGpa}</h2>
              <div className="mt-4 flex items-center text-sm text-indigo-300">
                <GraduationCap className="mr-2 h-4 w-4" /> B.Tech — {degree}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{degree}</h3>
              <div className="flex items-center text-sm text-emerald-600 font-medium">
                <CheckCircle2 className="mr-2 h-4 w-4" /> In Good Standing
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {terms.map((term) => (
            <Card key={term.semester} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-4">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">{term.semester}</CardTitle>
                <span className="text-sm font-semibold text-muted-foreground">GPA: {term.gpa} · Credits: {term.credits}</span>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-right">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {term.courses.map((c) => (
                      <TableRow key={c.courseCode}>
                        <TableCell className="font-medium">{c.courseCode}</TableCell>
                        <TableCell>{c.courseName}</TableCell>
                        <TableCell className="text-center">{c.credits}</TableCell>
                        <TableCell className="text-right font-bold">{c.grade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
