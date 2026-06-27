import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { requireAuth, requireStaff } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const filter =
      session!.user.role === 'staff'
        ? {}
        : { userId: session!.user.id };

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    return NextResponse.json(
      { message: 'Students cannot create tasks. Use Assignments page as staff to post assignments.' },
      { status: 403 }
    );
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
