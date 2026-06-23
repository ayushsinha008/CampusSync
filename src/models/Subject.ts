import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  faculty?: string;
  room?: string;
  attendance: number;
  totalClasses: number;
}

const SubjectSchema = new Schema<ISubject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    faculty: { type: String },
    room: { type: String },
    attendance: { type: Number, default: 0 },
    totalClasses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
