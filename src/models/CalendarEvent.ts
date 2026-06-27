import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'exam' | 'club' | 'assignment' | 'event';
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['exam', 'club', 'assignment', 'event'], default: 'event' },
  },
  { timestamps: true }
);

export default mongoose.models.CalendarEvent ||
  mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
