import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Note from '@/models/Note';
import { requireStaff } from '@/lib/auth-session';
import { getSubjectsWithAttendance } from '@/lib/student-data';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const student = await User.findOne({ _id: id, role: 'student' }).select('-password');
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const [tasks, notes, subjects] = await Promise.all([
      Task.find({ userId: id }).sort({ createdAt: -1 }),
      Note.find({ userId: id }).sort({ updatedAt: -1 }),
      getSubjectsWithAttendance(id),
    ]);

    return NextResponse.json({ student, tasks, notes, subjects });
  } catch {
    return NextResponse.json({ message: 'Error fetching student data' }, { status: 500 });
  }
}
