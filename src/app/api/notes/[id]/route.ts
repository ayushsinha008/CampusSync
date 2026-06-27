import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import { requireAuth } from '@/lib/auth-session';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const filter =
      session!.user.role === 'staff'
        ? { _id: id }
        : { _id: id, userId: session!.user.id };

    const note = await Note.findOneAndDelete(filter);

    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch {
    return NextResponse.json({ message: 'Error deleting note' }, { status: 500 });
  }
}
