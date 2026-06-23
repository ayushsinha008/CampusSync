import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  rollNumber?: string;
  branch?: string;
  semester?: number;
  image?: string;
  role: 'student' | 'staff';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    rollNumber: { type: String },
    branch: { type: String },
    semester: { type: Number },
    image: { type: String },
    role: { type: String, enum: ['student', 'staff'], default: 'student' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
