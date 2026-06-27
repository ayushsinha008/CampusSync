import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  ticketId: string;
  category: string;
  description: string;
  status: string;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'Open' },
  },
  { timestamps: true }
);

export default mongoose.models.MaintenanceRequest ||
  mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
