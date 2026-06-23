import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'Uncategorized' },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
