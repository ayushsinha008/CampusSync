import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FinancialAid from '@/models/FinancialAid';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const awards = await FinancialAid.find({ studentId: session!.user.id });
    const totalAccepted = awards.filter((a) => a.status === 'Accepted').reduce((s, a) => s + a.amount, 0);
    const totalOffered = awards.filter((a) => a.status !== 'Declined').reduce((s, a) => s + a.amount, 0);

    return NextResponse.json({
      awards,
      totalAccepted,
      totalOffered,
      fafsaStatus: 'Application Received',
      fafsaNote: 'Your 2025-26 scholarship application was processed on 12 April 2025.',
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching financial aid' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id, status } = await req.json();
    if (!id || !['Accepted', 'Declined'].includes(status)) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    await connectDB();
    const award = await FinancialAid.findOneAndUpdate(
      { _id: id, studentId: session!.user.id },
      { status },
      { new: true }
    );

    if (!award) {
      return NextResponse.json({ message: 'Award not found' }, { status: 404 });
    }

    return NextResponse.json(award);
  } catch {
    return NextResponse.json({ message: 'Error updating award' }, { status: 500 });
  }
}
