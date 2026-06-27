import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Teacher from '@/models/Teacher';
import { serializePublicProfile, isStudentProfileComplete } from '@/lib/user-profile';
import { serializeFacultyProfile } from '@/lib/teacher-profile';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token?.trim()) {
      return NextResponse.json({ message: 'Invalid entry pass' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ entryToken: token.trim() }).select('-password -entryToken');
    if (user) {
      if (!isStudentProfileComplete(user)) {
        return NextResponse.json({ message: 'Entry pass is not active yet. Complete your profile first.' }, { status: 403 });
      }
      return NextResponse.json(serializePublicProfile(user));
    }

    const teacher = await Teacher.findOne({ entryToken: token.trim() }).select('-entryToken');
    if (teacher) {
      return NextResponse.json(serializeFacultyProfile(teacher));
    }

    return NextResponse.json({ message: 'Entry pass not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ message: 'Error loading entry pass' }, { status: 500 });
  }
}
