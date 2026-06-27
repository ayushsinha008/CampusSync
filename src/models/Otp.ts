import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: 'signup' | 'reset';
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ['signup', 'reset'], default: 'signup' },
  createdAt: { type: Date, default: Date.now, expires: '5m' },
});

const Otp = mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema);

export default Otp;
