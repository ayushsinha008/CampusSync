import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const payments = await Payment.find({ studentId: session!.user.id }).sort({ date: -1 });
    const pendingAmount = payments
      .filter((p) => p.status === 'Pending')
      .reduce((s, p) => s + p.amount, 0);

    return NextResponse.json({ payments, pendingAmount, dueDate: '30 June 2026' });
  } catch {
    return NextResponse.json({ message: 'Error fetching payments' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const result = await Payment.updateMany(
      { studentId: session!.user.id, status: 'Pending' },
      { status: 'Paid' }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'No pending payments' }, { status: 400 });
    }

    const payments = await Payment.find({ studentId: session!.user.id }).sort({ date: -1 });
    const pendingAmount = payments
      .filter((p) => p.status === 'Pending')
      .reduce((s, p) => s + p.amount, 0);

    return NextResponse.json({ payments, pendingAmount, message: 'Payment successful' });
  } catch {
    return NextResponse.json({ message: 'Error processing payment' }, { status: 500 });
  }
}
