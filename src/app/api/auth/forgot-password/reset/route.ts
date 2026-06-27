import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import Notification from '@/models/Notification';
import bcrypt from 'bcryptjs';
import { normalizeEmail } from '@/lib/auth-session';
import { sendPasswordChangedEmail } from '@/lib/otp';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: 'Email, OTP and new password are required' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail === STAFF_EMAIL) {
      return NextResponse.json({ message: 'Organization accounts cannot reset password here.' }, { status: 403 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: normalizedEmail, role: 'student' });
    if (!user) {
      return NextResponse.json({ message: 'Student account not found' }, { status: 404 });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'reset' }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return NextResponse.json({ message: 'OTP expired or not found. Request a new one.' }, { status: 400 });
    }

    if (otpRecord.otp !== String(otp).trim()) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'reset' });

    await Notification.create({
      userId: user._id,
      title: 'Password Changed',
      message: 'Your account password was updated successfully.',
      type: 'success',
    });

    try {
      await sendPasswordChangedEmail(normalizedEmail, user.name);
    } catch {
      // Password already saved; email failure should not block reset
    }

    return NextResponse.json(
      { message: 'Password changed successfully', email: normalizedEmail, name: user.name },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'An error occurred while resetting password' }, { status: 500 });
  }
}
