import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';
import { requireStaff } from '@/lib/auth-session';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { error } = await requireStaff();
    if (error) return error;

    await connectDB();
    const timetable = await Timetable.findOneAndDelete({ _id: id });

    if (!timetable) {
      return NextResponse.json({ message: 'Timetable slot not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch {
    return NextResponse.json({ message: 'Error deleting timetable slot' }, { status: 500 });
  }
}
