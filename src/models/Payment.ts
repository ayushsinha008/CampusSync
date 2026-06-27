import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  transactionId: string;
  date: Date;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
