import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '5m' }, // OTP expires in 5 minutes
});

const Otp = mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema);

export default Otp;
