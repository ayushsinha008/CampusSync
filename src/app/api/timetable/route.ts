import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';
import { requireAuth, requireStaff } from '@/lib/auth-session';
import { isValidDepartmentProgram } from '@/lib/academic-catalog';

export async function GET(req: Request) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const program = searchParams.get('program');

    await connectDB();

    const filter: Record<string, string> = {};
    if (department) filter.department = department;
    if (program) filter.program = program;

    const timetables = await Timetable.find(filter)
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

    const { subjectId, day, startTime, endTime, department, program } = await req.json();

    if (!subjectId || !day || !startTime || !endTime || !department || !program) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (!isValidDepartmentProgram(department, program)) {
      return NextResponse.json({ message: 'Invalid department or program' }, { status: 400 });
    }

    await connectDB();
    const timetable = await Timetable.create({
      userId: session!.user.id,
      subjectId,
      department,
      program,
      day,
      startTime,
      endTime,
    });

    const populated = await Timetable.findById(timetable._id).populate('subjectId');
    return NextResponse.json(populated, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error creating timetable slot' }, { status: 500 });
  }
}
