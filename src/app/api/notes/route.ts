import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const filter =
      session!.user.role === 'staff'
        ? {}
        : { userId: session!.user.id };

    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ message: 'Error fetching notes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session!.user.role === 'staff') {
      return NextResponse.json({ message: 'Staff cannot create student notes here.' }, { status: 403 });
    }

    const { title, content, category } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    await connectDB();
    const note = await Note.create({
      userId: session!.user.id,
      title: title.trim(),
      content: content.trim(),
      category: category || 'Uncategorized',
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error creating note' }, { status: 500 });
  }
}
