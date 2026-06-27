import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialAid extends Document {
  studentId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  type: 'Grant' | 'Scholarship' | 'Loan';
  status: 'Accepted' | 'Offered' | 'Declined';
}

const FinancialAidSchema = new Schema<IFinancialAid>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Grant', 'Scholarship', 'Loan'], required: true },
    status: { type: String, enum: ['Accepted', 'Offered', 'Declined'], default: 'Offered' },
  },
  { timestamps: true }
);

export default mongoose.models.FinancialAid || mongoose.model<IFinancialAid>('FinancialAid', FinancialAidSchema);
