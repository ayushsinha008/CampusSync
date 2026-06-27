import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-session';
import { getStudentEntryUrl, isStudentProfileComplete, syncStudentEntryToken } from '@/lib/user-profile';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const user = await User.findById(session!.user.id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await syncStudentEntryToken(user);

    const json = user.toObject();
    const entryUrl = getStudentEntryUrl(user);
    return NextResponse.json({
      ...json,
      entryUrl,
      qrReady: isStudentProfileComplete(user),
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session!.user.role !== 'student') {
      return NextResponse.json({ message: 'Only students can update academic details' }, { status: 403 });
    }

    const body = await req.json();
    const { rollNumber, branch, semester } = body as {
      rollNumber?: string;
      branch?: string;
      semester?: number | string;
    };

    await connectDB();
    const user = await User.findById(session!.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (rollNumber !== undefined) {
      const trimmed = String(rollNumber).trim();
      user.rollNumber = trimmed || undefined;
    }
    if (branch !== undefined) {
      const trimmed = String(branch).trim();
      user.branch = trimmed || undefined;
    }
    if (semester !== undefined) {
      const sem = semester === '' || semester === null ? undefined : Number(semester);
      if (sem !== undefined && (Number.isNaN(sem) || sem < 1 || sem > 12)) {
        return NextResponse.json({ message: 'Semester must be between 1 and 12' }, { status: 400 });
      }
      user.semester = sem;
    }

    await user.save();
    await syncStudentEntryToken(user);

    const entryUrl = getStudentEntryUrl(user);
    return NextResponse.json({
      rollNumber: user.rollNumber || null,
      branch: user.branch || null,
      semester: user.semester ?? null,
      entryUrl,
      qrReady: isStudentProfileComplete(user),
    });
  } catch {
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
