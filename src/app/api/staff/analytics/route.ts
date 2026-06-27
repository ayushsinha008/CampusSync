import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireStaff } from '@/lib/auth-session';
import { buildAdminAnalytics, filterAnalyticsBySection } from '@/lib/admin-analytics';

export async function GET(req: Request) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    await connectDB();
    const data = await buildAdminAnalytics();
    return NextResponse.json(filterAnalyticsBySection(data, section));
  } catch {
    return NextResponse.json({ message: 'Error loading analytics' }, { status: 500 });
  }
}
