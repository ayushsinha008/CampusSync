import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import Subject from '@/models/Subject';
import StudentAttendance from '@/models/StudentAttendance';
import { requireStaff } from '@/lib/auth-session';
import { ensureTeachersFromSubjects } from '@/lib/admin-analytics';
import { ensureTeacherEntryTokens } from '@/lib/teacher-profile';

export async function GET() {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    await connectDB();
    await ensureTeachersFromSubjects();
    await ensureTeacherEntryTokens();

    const teachers = await Teacher.find().sort({ name: 1 }).lean();
    const subjects = await Subject.find().select('_id name faculty').lean();

    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        const subjectIds = subjects
          .filter((s) => s.faculty?.trim() === teacher.name.trim())
          .map((s) => s._id);

        const studentCount =
          subjectIds.length > 0
            ? await StudentAttendance.distinct('studentId', { subjectId: { $in: subjectIds } })
            : [];

        return {
          _id: teacher._id.toString(),
          name: teacher.name,
          email: teacher.email,
          department: teacher.department,
          status: teacher.status,
          subjects: teacher.subjects,
          stats: {
            subjectCount: teacher.subjects?.length ?? subjectIds.length,
            studentCount: studentCount.length,
          },
        };
      })
    );

    return NextResponse.json(teachersWithStats);
  } catch {
    return NextResponse.json({ message: 'Error fetching teachers' }, { status: 500 });
  }
}
