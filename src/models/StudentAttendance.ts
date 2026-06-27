import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  attendance: number;
  totalClasses: number;
}

const StudentAttendanceSchema = new Schema<IStudentAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    attendance: { type: Number, default: 0 },
    totalClasses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StudentAttendanceSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

export default mongoose.models.StudentAttendance ||
  mongoose.model<IStudentAttendance>('StudentAttendance', StudentAttendanceSchema);
