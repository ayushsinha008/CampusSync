import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import Otp from '@/models/Otp';
import { randomUUID } from 'crypto';
import { normalizeEmail } from '@/lib/auth-session';
import { ensureStudentEnrollments } from '@/lib/student-data';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');

export async function POST(req: Request) {
  try {
    const { name, email, password, otp } = await req.json();

    if (!name || !email || !password || !otp) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail === STAFF_EMAIL) {
      return NextResponse.json({ message: 'Organization admin accounts cannot be created via Sign Up.' }, { status: 403 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'signup' }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return NextResponse.json({ message: 'OTP expired or not found. Please request a new one.' }, { status: 400 });
    }

    if (otpRecord.otp !== otp.trim()) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'signup' });

    const duplicateCheck = await User.findOne({ email: normalizedEmail });
    if (duplicateCheck) {
      return NextResponse.json({ message: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const entryToken = randomUUID();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student',
      entryToken,
      branch: 'Computer Science',
      semester: 4,
    });

    user.rollNumber = `CS2026-${user._id.toString().slice(-4).toUpperCase()}`;
    await user.save();

    await ensureStudentEnrollments(user._id.toString());

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ message: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
