import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Completed';
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
