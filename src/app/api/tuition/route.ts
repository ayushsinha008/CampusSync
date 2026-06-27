import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FeeItem from '@/models/FeeItem';
import FinancialAid from '@/models/FinancialAid';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const [fees, aid] = await Promise.all([
      FeeItem.find({ studentId: session!.user.id }),
      FinancialAid.find({ studentId: session!.user.id, status: 'Accepted' }),
    ]);

    const totalCharges = fees.reduce((s, f) => s + f.amount, 0);
    const aidApplied = aid.reduce((s, a) => s + a.amount, 0);
    const previousBalance = 0;
    const amountDue = Math.max(totalCharges + previousBalance - aidApplied, 0);

    return NextResponse.json({
      fees,
      term: fees[0]?.term || 'Semester 2025-26',
      summary: { previousBalance, totalCharges, aidApplied, amountDue },
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching tuition data' }, { status: 500 });
  }
}
