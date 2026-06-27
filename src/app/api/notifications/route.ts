import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const notifications = await Notification.find({ userId: session!.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ message: 'Error fetching notifications' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    await Notification.updateMany({ userId: session!.user.id, read: false }, { read: true });

    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch {
    return NextResponse.json({ message: 'Error updating notifications' }, { status: 500 });
  }
}
