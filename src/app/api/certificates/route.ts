import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const certificates = await Certificate.find({ studentId: session!.user.id }).sort({ awardedDate: -1 });
    return NextResponse.json(certificates);
  } catch {
    return NextResponse.json({ message: 'Error fetching certificates' }, { status: 500 });
  }
}
