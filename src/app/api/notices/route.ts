import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notice from '@/models/Notice';
import { requireAuth, requireStaff } from '@/lib/auth-session';

export async function GET() {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const notices = await Notice.find().sort({ pinned: -1, date: -1 });
    return NextResponse.json(notices);
  } catch {
    return NextResponse.json({ message: 'Error fetching notices' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireStaff();
    if (error) return error;

    const { title, description, category, pinned } = await req.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ message: 'Title and description are required' }, { status: 400 });
    }

    await connectDB();
    const notice = await Notice.create({
      userId: session!.user.id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      pinned: pinned || false,
    });

    return NextResponse.json(notice, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error creating notice' }, { status: 500 });
  }
}
