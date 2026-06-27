import mongoose, { Schema, Document } from 'mongoose';

export interface IGrade extends Document {
  studentId: mongoose.Types.ObjectId;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  semester: string;
  status: string;
}

const GradeSchema = new Schema<IGrade>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    credits: { type: Number, required: true },
    grade: { type: String, required: true },
    semester: { type: String, required: true },
    status: { type: String, default: 'Completed' },
  },
  { timestamps: true }
);

export default mongoose.models.Grade || mongoose.model<IGrade>('Grade', GradeSchema);
