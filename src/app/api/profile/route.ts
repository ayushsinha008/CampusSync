import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { requireAuth, normalizeEmail } from '@/lib/auth-session';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const user = await User.findById(session!.user.id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { name, email, password, rollNumber, branch, semester } = await req.json();

    await connectDB();
    const user = await User.findById(session!.user.id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    if (name) user.name = name.trim();

    if (email) {
      const normalizedEmail = normalizeEmail(email);
      if (normalizedEmail === STAFF_EMAIL && user.role !== 'staff') {
        return NextResponse.json({ message: 'This email is reserved for staff.' }, { status: 403 });
      }
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) {
        return NextResponse.json({ message: 'Email is already in use.' }, { status: 409 });
      }
      user.email = normalizedEmail;
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (branch !== undefined) user.branch = branch;
    if (semester !== undefined) user.semester = semester;

    await user.save();

    return NextResponse.json({ message: 'Profile updated' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
