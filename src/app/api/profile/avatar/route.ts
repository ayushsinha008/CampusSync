import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-session';
import { saveUpload } from '@/lib/upload';

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }

    const { url } = await saveUpload(file, 'avatars');

    await connectDB();
    const user = await User.findById(session!.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.image = url;
    await user.save();

    return NextResponse.json({ image: url, message: 'Profile photo updated' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error uploading image';
    return NextResponse.json({ message }, { status: 400 });
  }
}
