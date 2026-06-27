import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  tagline?: string;
  category: string;
  description: string;
  website?: string;
  logo?: string;
  status: 'active' | 'inactive';
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String },
    category: { type: String, default: 'Campus Club' },
    description: { type: String, required: true },
    website: { type: String },
    logo: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', OrganizationSchema);
