import { randomUUID } from 'crypto';
import Teacher from '@/models/Teacher';

export function buildFacultyEntryUrl(entryToken: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/entry/${entryToken}`;
}

export async function ensureTeacherEntryTokens() {
  const teachers = await Teacher.find({
    $or: [{ entryToken: { $exists: false } }, { entryToken: null }, { entryToken: '' }],
  });

  await Promise.all(
    teachers.map(async (teacher) => {
      teacher.entryToken = randomUUID();
      await teacher.save();
    })
  );
}

export async function ensureTeacherEntryToken(teacherId: string) {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) return null;
  if (!teacher.entryToken) {
    teacher.entryToken = randomUUID();
    await teacher.save();
  }
  return teacher;
}

export function serializeFacultyProfile(teacher: {
  name: string;
  email?: string;
  department: string;
  status: string;
  subjects: string[];
}) {
  return {
    name: teacher.name,
    email: teacher.email || '',
    image: null,
    role: 'faculty',
    department: teacher.department,
    status: teacher.status,
    subjects: teacher.subjects,
    rollNumber: null,
    branch: null,
    semester: null,
  };
}
