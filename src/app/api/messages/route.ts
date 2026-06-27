import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notice from '@/models/Notice';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const [notices, notifications] = await Promise.all([
      Notice.find().sort({ date: -1 }).limit(5),
      Notification.find({ userId: session!.user.id }).sort({ createdAt: -1 }).limit(5),
    ]);

    const messages = [
      ...notifications.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        body: n.message,
        href: '/profile',
        time: n.createdAt,
        kind: 'personal' as const,
      })),
      ...notices.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        body: n.description,
        href: '/notices',
        time: n.date,
        kind: 'campus' as const,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}
