import Grade from '@/models/Grade';

export async function ensureStudentGrades(studentId: string) {
  return Grade.find({ studentId }).sort({ semester: -1 });
}
