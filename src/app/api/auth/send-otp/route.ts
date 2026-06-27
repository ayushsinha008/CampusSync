import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Otp from '@/models/Otp';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';
import { normalizeEmail } from '@/lib/auth-session';
import crypto from 'crypto';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');
const OTP_COOLDOWN_MS = 60 * 1000;

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail === STAFF_EMAIL) {
      return NextResponse.json({ message: 'Staff accounts cannot be created via Sign Up. Use staff login credentials.' }, { status: 403 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists. Please log in instead.' }, { status: 409 });
    }

    const recentOtp = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (recentOtp && Date.now() - new Date(recentOtp.createdAt).getTime() < OTP_COOLDOWN_MS) {
      return NextResponse.json({ message: 'Please wait a minute before requesting another OTP.' }, { status: 429 });
    }

    const otp = generateOTP();
    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({ email: normalizedEmail, otp });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>CampusSync Verification</h2>
        <p>Your OTP for signing up to CampusSync is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
        <p>This OTP will expire in 5 minutes. Do not share it with anyone.</p>
      </div>
    `;

    await sendEmail(normalizedEmail, 'Your CampusSync Verification OTP', html);

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ message: 'An error occurred while sending OTP' }, { status: 500 });
  }
}
