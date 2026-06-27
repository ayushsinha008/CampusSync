import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthSession extends Document {
  sid: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const AuthSessionSchema = new Schema<IAuthSession>(
  {
    sid: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

AuthSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.AuthSession ||
  mongoose.model<IAuthSession>('AuthSession', AuthSessionSchema);
