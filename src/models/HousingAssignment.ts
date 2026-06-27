import mongoose, { Schema, Document } from 'mongoose';

export type HousingVerificationStatus = 'verified' | 'fake' | 'suspicious' | 'pending';

export interface IHousingAssignment extends Document {
  studentId?: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail?: string;
  rollNumber?: string;
  branch?: string;
  building: string;
  location: string;
  room: string;
  roomType: string;
  status: string;
  term: string;
  roommateName?: string;
  roommateMajor?: string;
  verificationStatus: HousingVerificationStatus;
  flagReason?: string;
}

const HousingAssignmentSchema = new Schema<IHousingAssignment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String, required: true },
    studentEmail: { type: String },
    rollNumber: { type: String },
    branch: { type: String },
    building: { type: String, required: true },
    location: { type: String, required: true },
    room: { type: String, required: true },
    roomType: { type: String, required: true },
    status: { type: String, default: 'Assigned' },
    term: { type: String, required: true },
    roommateName: { type: String },
    roommateMajor: { type: String },
    verificationStatus: {
      type: String,
      enum: ['verified', 'fake', 'suspicious', 'pending'],
      default: 'pending',
    },
    flagReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.HousingAssignment ||
  mongoose.model<IHousingAssignment>('HousingAssignment', HousingAssignmentSchema);
