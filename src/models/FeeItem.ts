import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeItem extends Document {
  studentId: mongoose.Types.ObjectId;
  item: string;
  amount: number;
  category: string;
  term: string;
}

const FeeItemSchema = new Schema<IFeeItem>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    term: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.FeeItem || mongoose.model<IFeeItem>('FeeItem', FeeItemSchema);
