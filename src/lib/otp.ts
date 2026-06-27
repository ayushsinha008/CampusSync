import crypto from 'crypto';
import Otp from '@/models/Otp';
import { sendEmail } from '@/lib/sendEmail';

export const OTP_COOLDOWN_MS = 60 * 1000;

export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: 'signup' | 'reset'
) {
  const isReset = purpose === 'reset';
  const subject = isReset
    ? 'CampusSync Password Reset OTP'
    : 'Your CampusSync Verification OTP';
  const heading = isReset ? 'Reset Your Password' : 'CampusSync Verification';
  const intro = isReset
    ? 'Use this OTP to reset your CampusSync student account password:'
    : 'Your OTP for signing up to CampusSync is:';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>${heading}</h2>
      <p>${intro}</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
      <p>This OTP will expire in 5 minutes. Do not share it with anyone.</p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

export async function createAndSendOtp(
  email: string,
  purpose: 'signup' | 'reset'
) {
  const recentOtp = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (recentOtp && Date.now() - new Date(recentOtp.createdAt).getTime() < OTP_COOLDOWN_MS) {
    return { error: 'Please wait a minute before requesting another OTP.' as const };
  }

  const otp = generateOTP();
  await Otp.deleteMany({ email, purpose });
  await Otp.create({ email, otp, purpose });
  await sendOtpEmail(email, otp, purpose);

  return { success: true as const };
}

export async function sendPasswordChangedEmail(email: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Password Changed Successfully</h2>
      <p>Hi ${name},</p>
      <p>Your CampusSync account password was changed successfully.</p>
      <p>If you did not make this change, contact your campus administrator immediately.</p>
    </div>
  `;
  await sendEmail(email, 'CampusSync — Password Changed', html);
}
