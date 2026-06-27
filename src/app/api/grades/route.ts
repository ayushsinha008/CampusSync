import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth-session';
import {
  buildGpaChartData,
  computeStats,
} from '@/lib/student-grades';
import { ensureStudentGrades } from '@/lib/student-grades.server';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const grades = await ensureStudentGrades(session!.user.id);
    const gradeRows = grades.map((g) => ({
      _id: g._id.toString(),
      courseCode: g.courseCode,
      courseName: g.courseName,
      credits: g.credits,
      grade: g.grade,
      semester: g.semester,
      status: g.status,
    }));

    const semesters = [...new Set(gradeRows.map((g) => g.semester))].sort().reverse();
    const latestSemester = semesters[0] || '';

    return NextResponse.json({
      grades: gradeRows,
      semesters,
      chartData: buildGpaChartData(gradeRows),
      stats: computeStats(gradeRows, latestSemester),
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching grades' }, { status: 500 });
  }
}
