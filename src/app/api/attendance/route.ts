import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentAttendance from '@/models/StudentAttendance';
import Subject from '@/models/Subject';
import User from '@/models/User';
import { requireStaff } from '@/lib/auth-session';
import { ensureStudentEnrollments } from '@/lib/student-data';

export async function POST(req: Request) {
  try {
    const { session, error } = await requireStaff();
    if (error) return error;

    const { studentId, subjectId, status } = await req.json();

    if (!studentId || !subjectId || !['present', 'absent'].includes(status)) {
      return NextResponse.json({ message: 'studentId, subjectId, and valid status are required' }, { status: 400 });
    }

    await connectDB();

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    await ensureStudentEnrollments(studentId);

    const record = await StudentAttendance.findOneAndUpdate(
      { studentId, subjectId },
      {
        $inc: {
          totalClasses: 1,
          attendance: status === 'present' ? 1 : 0,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(record, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Error marking attendance' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { session, error } = await requireStaff();
    if (error) return error;

    await connectDB();
    const records = await StudentAttendance.find()
      .populate('studentId', 'name email rollNumber')
      .populate('subjectId', 'name faculty room')
      .sort({ updatedAt: -1 });

    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ message: 'Error fetching attendance records' }, { status: 500 });
  }
}
