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
      return NextResponse.json({ message: 'Organization admin accounts cannot be created via Sign Up. Use the Organization tab on the login page.' }, { status: 403 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists. Please log in instead.' }, { status: 409 });
    }

    const result = await createAndSendOtp(normalizedEmail, 'signup');
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: 429 });
    }

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ message: 'An error occurred while sending OTP' }, { status: 500 });
  }
}
