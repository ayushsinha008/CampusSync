import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Otp from '@/models/Otp';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Generate and save OTP
    const otp = generateOTP();
    
    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });
    
    await Otp.create({ email, otp });

    // Send email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>CampusSync Verification</h2>
        <p>Your OTP for signing up to CampusSync is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
        <p>This OTP will expire in 5 minutes. Do not share it with anyone.</p>
      </div>
    `;

    await sendEmail(email, 'Your CampusSync Verification OTP', html);

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ message: 'An error occurred while sending OTP' }, { status: 500 });
  }
}
