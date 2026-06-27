import mongoose from 'mongoose';
import Grade from '@/models/Grade';
import { DEMO_GRADE_ROWS } from '@/lib/student-grades';

export async function ensureStudentGrades(studentId: string | mongoose.Types.ObjectId) {
  const count = await Grade.countDocuments({ studentId });
  if (count === 0) {
    await Grade.insertMany(DEMO_GRADE_ROWS.map((row) => ({ ...row, studentId })));
  }
  return Grade.find({ studentId }).sort({ semester: -1 });
}
