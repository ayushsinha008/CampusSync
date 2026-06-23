import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Notice from '@/models/Notice';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    // In a real app, notices might be campus-wide, but for this demo, we'll fetch all 
    // or user-specific. The seed script created global notices (or assigned to the user).
    // Let's fetch all notices sorted by date.
    const notices = await Notice.find().sort({ pinned: -1, date: -1 });
    return NextResponse.json(notices);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching notices' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'staff') {
      return NextResponse.json({ message: 'Unauthorized: Staff access required' }, { status: 403 });
    }

    const { title, description, category, pinned } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ message: 'Title and description are required' }, { status: 400 });
    }

    await connectDB();
    const notice = await Notice.create({
      userId: session.user.id,
      title,
      description,
      category: category || 'General',
      pinned: pinned || false,
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating notice' }, { status: 500 });
  }
}
