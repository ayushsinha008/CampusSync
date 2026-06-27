'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, CheckCircle2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const TRANSCRIPT_DATA = [
  {
    semester: 'Fall 2023',
    gpa: 3.84,
    credits: 15,
    courses: [
      { code: 'CS 301', name: 'Data Structures & Algorithms', credits: 4, grade: 'A' },
      { code: 'MATH 220', name: 'Linear Algebra', credits: 3, grade: 'A-' },
      { code: 'ENG 105', name: 'Academic Writing', credits: 3, grade: 'B+' },
    ]
  },
  {
    semester: 'Spring 2023',
    gpa: 3.75,
    credits: 16,
    courses: [
      { code: 'CS 200', name: 'Intro to Computer Science', credits: 4, grade: 'A' },
      { code: 'MATH 150', name: 'Calculus I', credits: 4, grade: 'B+' },
      { code: 'PHY 101', name: 'Physics I', credits: 4, grade: 'A-' },
      { code: 'HIS 101', name: 'World History', credits: 4, grade: 'A' },
    ]
  }
];

export default function TranscriptPage() {
  const handleDownload = () => {
    toast.success('Your official transcript request is processing. You will receive an email shortly.');
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Transcript</h1>
          <p className="text-sm text-slate-500 mt-1">View your complete academic history and request official records.</p>
        </div>
        <Button className="bg-[#1C64F2] hover:bg-blue-700 text-white" onClick={handleDownload}>
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
              <h2 className="text-5xl font-bold">3.78</h2>
              <div className="mt-4 flex items-center text-sm text-indigo-300">
                <GraduationCap className="mr-2 h-4 w-4" />
                Undergraduate - BS
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium">Degree Status</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Computer Science</h3>
              <div className="flex items-center text-sm text-emerald-600 font-medium">
                <CheckCircle2 className="mr-2 h-4 w-4" /> In Good Standing
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {TRANSCRIPT_DATA.map((term, i) => (
            <Card key={i} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row justify-between items-center py-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-indigo-500" />
                  {term.semester}
                </CardTitle>
                <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                  Term GPA: <span className="text-indigo-600 font-bold">{term.gpa}</span> | Credits: {term.credits}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[120px] font-semibold">Course Code</TableHead>
                      <TableHead className="font-semibold">Course Name</TableHead>
                      <TableHead className="font-semibold text-center">Credits</TableHead>
                      <TableHead className="text-right font-semibold">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {term.courses.map((course, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold text-slate-600">{course.code}</TableCell>
                        <TableCell className="text-slate-800">{course.name}</TableCell>
                        <TableCell className="text-center text-slate-600">{course.credits}</TableCell>
                        <TableCell className="text-right font-bold text-slate-800">{course.grade}</TableCell>
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
