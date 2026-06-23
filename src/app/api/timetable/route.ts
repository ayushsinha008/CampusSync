import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const timetables = await Timetable.find({})
      .populate('subjectId')
      .sort({ startTime: 1 });
      
    return NextResponse.json(timetables);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching timetable' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'staff') {
      return NextResponse.json({ message: 'Unauthorized: Staff access required' }, { status: 403 });
    }

    const { subjectId, day, startTime, endTime } = await req.json();

    if (!subjectId || !day || !startTime || !endTime) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const timetable = await Timetable.create({
      userId: session.user.id,
      subjectId,
      day,
      startTime,
      endTime,
    });

    return NextResponse.json(timetable, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating timetable slot' }, { status: 500 });
  }
}
