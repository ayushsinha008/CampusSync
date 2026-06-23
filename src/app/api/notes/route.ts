import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const notes = await Note.find({ userId: session.user.id }).sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching notes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    await connectDB();
    const note = await Note.create({
      userId: session.user.id,
      title,
      content,
      category: category || 'Uncategorized',
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating note' }, { status: 500 });
  }
}
