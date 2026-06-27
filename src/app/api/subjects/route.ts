import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';
import { requireAuth, requireStaff } from '@/lib/auth-session';
import { getSubjectsWithAttendance } from '@/lib/student-data';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    if (session!.user.role === 'staff') {
      const subjects = await Subject.find().sort({ createdAt: -1 });
      return NextResponse.json(subjects);
    }

    const subjects = await getSubjectsWithAttendance(session!.user.id);
    return NextResponse.json(subjects);
  } catch {
    return NextResponse.json({ message: 'Error fetching subjects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireStaff();
    if (error) return error;

    const { name, faculty, room } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.create({
      userId: session!.user.id,
      name: name.trim(),
      faculty,
      room,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error creating subject' }, { status: 500 });
  }
}
