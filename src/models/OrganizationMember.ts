import mongoose, { Schema, Document } from 'mongoose';

export type MemberStatus = 'verified' | 'fake' | 'pending' | 'suspicious';

export interface IOrganizationMember extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  rollNumber?: string;
  branch?: string;
  status: MemberStatus;
  flagReason?: string;
  joinedAt: Date;
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    rollNumber: { type: String },
    branch: { type: String },
    status: {
      type: String,
      enum: ['verified', 'fake', 'pending', 'suspicious'],
      default: 'pending',
    },
    flagReason: { type: String },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OrganizationMemberSchema.index({ organizationId: 1, email: 1 }, { unique: true });

export default mongoose.models.OrganizationMember ||
  mongoose.model<IOrganizationMember>('OrganizationMember', OrganizationMemberSchema);
