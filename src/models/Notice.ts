import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  pinned: boolean;
  date: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    pinned: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
