import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const subjects = await Subject.find({}).sort({ createdAt: -1 });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching subjects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'staff') {
      return NextResponse.json({ message: 'Unauthorized: Staff access required' }, { status: 403 });
    }

    const { name, faculty, room } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.create({
      userId: session.user.id,
      name,
      faculty,
      room,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating subject' }, { status: 500 });
  }
}
