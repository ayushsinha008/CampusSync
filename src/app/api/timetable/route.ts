import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';
import { requireAuth, requireStaff } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const timetables = await Timetable.find()
      .populate('subjectId')
      .sort({ day: 1, startTime: 1 });

    return NextResponse.json(timetables);
  } catch {
    return NextResponse.json({ message: 'Error fetching timetable' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireStaff();
    if (error) return error;

    const { subjectId, day, startTime, endTime } = await req.json();

    if (!subjectId || !day || !startTime || !endTime) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const timetable = await Timetable.create({
      userId: session!.user.id,
      subjectId,
      day,
      startTime,
      endTime,
    });

    return NextResponse.json(timetable, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error creating timetable slot' }, { status: 500 });
  }
}
