import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Note from '@/models/Note';
import { requireStaff } from '@/lib/auth-session';
import { getSubjectsWithAttendance } from '@/lib/student-data';

export async function GET() {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    await connectDB();

    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const [taskCount, noteCount, subjects] = await Promise.all([
          Task.countDocuments({ userId: student._id }),
          Note.countDocuments({ userId: student._id }),
          getSubjectsWithAttendance(student._id.toString()),
        ]);

        let totalClasses = 0;
        let totalAttendance = 0;
        subjects.forEach((s) => {
          totalClasses += s.totalClasses;
          totalAttendance += s.attendance;
        });

        return {
          ...student.toObject(),
          stats: {
            taskCount,
            noteCount,
            attendancePercentage:
              totalClasses > 0 ? Math.round((totalAttendance / totalClasses) * 100) : 0,
          },
        };
      })
    );

    return NextResponse.json(studentsWithStats);
  } catch {
    return NextResponse.json({ message: 'Error fetching students' }, { status: 500 });
  }
}
