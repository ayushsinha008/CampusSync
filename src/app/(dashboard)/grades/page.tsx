'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, BookOpen, GraduationCap, TrendingUp, Star } from 'lucide-react';

const MOCK_GRADES = [
  { id: 'CS101', name: 'Introduction to Computer Science', credits: 4, grade: 'A', status: 'Completed' },
  { id: 'MATH201', name: 'Calculus II', credits: 4, grade: 'B+', status: 'Completed' },
  { id: 'PHYS101', name: 'Physics Mechanics', credits: 4, grade: 'A-', status: 'Completed' },
  { id: 'ENG101', name: 'English Composition', credits: 3, grade: 'A', status: 'Completed' },
  { id: 'HIST101', name: 'World History', credits: 3, grade: 'B', status: 'Completed' },
];

const SEMESTER_GRADES = {
  semester: 'Fall 2023',
  gpa: '3.75'
};

export default function GradesPage() {
  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Grades & Performance</h1>
          <p className="text-sm text-slate-500 mt-1">Track your academic progress and course grades.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="fall2023">
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fall2023">Fall 2023</SelectItem>
              <SelectItem value="spring2023">Spring 2023</SelectItem>
              <SelectItem value="fall2022">Fall 2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Term GPA</p>
              <h3 className="text-2xl font-bold text-slate-800">3.75</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Current Term GPA</p>
              <h3 className="text-2xl font-bold text-slate-800">{SEMESTER_GRADES.gpa}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Cumulative GPA</p>
              <h3 className="text-2xl font-bold text-slate-800">3.78</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Earned Credits</p>
              <h3 className="text-2xl font-bold text-slate-800">45</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Academic Standing</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">Dean's List</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
          <CardTitle className="text-lg font-bold text-slate-800">{SEMESTER_GRADES.semester} Grades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[120px] font-semibold">Course Code</TableHead>
                <TableHead className="font-semibold">Course Name</TableHead>
                <TableHead className="font-semibold text-center">Credits</TableHead>
                <TableHead className="font-semibold text-center">Grade</TableHead>
                <TableHead className="text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_GRADES.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium text-slate-600">{course.id}</TableCell>
                  <TableCell className="text-slate-800">{course.name}</TableCell>
                  <TableCell className="text-center text-slate-600">{course.credits}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800">{course.grade}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {course.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
