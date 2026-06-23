import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('-password');
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password } = await req.json();

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    
    return NextResponse.json({ message: 'Profile updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
