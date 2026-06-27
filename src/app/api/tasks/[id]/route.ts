import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { requireAuth } from '@/lib/auth-session';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const { title, description, deadline, priority, completed } = await req.json();

    await connectDB();

    const filter =
      session!.user.role === 'staff'
        ? { _id: id }
        : { _id: id, userId: session!.user.id };

    const task = await Task.findOneAndUpdate(
      filter,
      { title, description, deadline, priority, completed },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    await connectDB();

    const filter =
      session!.user.role === 'staff'
        ? { _id: id }
        : { _id: id, userId: session!.user.id };

    const task = await Task.findOneAndDelete(filter);

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
