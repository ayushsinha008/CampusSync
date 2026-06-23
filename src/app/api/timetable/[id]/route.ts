import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'staff') {
      return NextResponse.json({ message: 'Unauthorized: Staff access required' }, { status: 403 });
    }

    await connectDB();
    const timetable = await Timetable.findOneAndDelete({ _id: id });

    if (!timetable) {
      return NextResponse.json({ message: 'Timetable slot not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting timetable slot' }, { status: 500 });
  }
}
