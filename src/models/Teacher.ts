import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  department: string;
  email?: string;
  entryToken?: string;
  status: 'Present' | 'On Leave' | 'Absent';
  subjects: string[];
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    department: { type: String, default: 'Computer Science' },
    email: { type: String },
    entryToken: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['Present', 'On Leave', 'Absent'], default: 'Present' },
    subjects: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
