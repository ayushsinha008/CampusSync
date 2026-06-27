import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CalendarEvent from '@/models/CalendarEvent';
import { requireAuth } from '@/lib/auth-session';

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    await connectDB();
    let query: Record<string, unknown> = { userId: session!.user.id };

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      query = { ...query, date: { $gte: start, $lte: end } };
    }

    const events = await CalendarEvent.find(query).sort({ date: 1 });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ message: 'Error fetching calendar events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { title, date, time, location, type } = await req.json();
    if (!title?.trim() || !date || !time?.trim()) {
      return NextResponse.json({ message: 'Title, date and time are required' }, { status: 400 });
    }

    await connectDB();
    const event = await CalendarEvent.create({
      userId: session!.user.id,
      title: title.trim(),
      date: new Date(date),
      time: time.trim(),
      location: location?.trim() || 'Campus',
      type: type || 'event',
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error creating event' }, { status: 500 });
  }
}
