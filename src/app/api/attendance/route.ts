import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'staff') {
      return NextResponse.json({ message: 'Unauthorized: Only staff can mark attendance' }, { status: 403 });
    }

    const { subjectId, status } = await req.json();

    if (!subjectId || !['present', 'absent'].includes(status)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    subject.totalClasses += 1;
    if (status === 'present') {
      subject.attendance += 1;
    }

    await subject.save();

    return NextResponse.json(subject, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error marking attendance' }, { status: 500 });
  }
}
