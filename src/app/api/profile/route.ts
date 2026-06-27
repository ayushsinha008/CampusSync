import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-session';
import { buildEntryUrl, ensureUserProfileFields } from '@/lib/user-profile';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const user = await User.findById(session!.user.id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await ensureUserProfileFields(user);

    const json = user.toObject();
    return NextResponse.json({
      ...json,
      entryUrl: buildEntryUrl(user.entryToken!),
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
  }
}
