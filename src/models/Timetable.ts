import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  department: string;
  program: string;
  day: string;
  startTime: string;
  endTime: string;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    department: { type: String, default: 'engineering' },
    program: { type: String, default: 'cse' },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Timetable || mongoose.model<ITimetable>('Timetable', TimetableSchema);
