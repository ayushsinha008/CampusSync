import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { normalizeEmail } from '@/lib/auth-session';
import { createAndSendOtp } from '@/lib/otp';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail === STAFF_EMAIL) {
      return NextResponse.json(
        { message: 'Organization accounts cannot reset password here. Contact campus admin.' },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: normalizedEmail, role: 'student' });
    if (!user) {
      return NextResponse.json(
        { message: 'No student account found with this email. Please sign up first.' },
        { status: 404 }
      );
    }

    const result = await createAndSendOtp(normalizedEmail, 'reset');
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: 429 });
    }

    return NextResponse.json({ message: 'OTP sent to your email' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    return NextResponse.json({ message: 'An error occurred while sending OTP' }, { status: 500 });
  }
}
