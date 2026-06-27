import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  issuer: string;
  awardedDate: Date;
  type: 'academic' | 'professional' | 'honor';
}

const CertificateSchema = new Schema<ICertificate>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    awardedDate: { type: Date, required: true },
    type: { type: String, enum: ['academic', 'professional', 'honor'], default: 'academic' },
  },
  { timestamps: true }
);

export default mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);
