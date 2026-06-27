import { randomUUID } from 'crypto';
import type { IUser } from '@/models/User';

export function buildEntryUrl(entryToken: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/entry/${entryToken}`;
}

export function isStudentProfileComplete(user: Pick<IUser, 'rollNumber' | 'branch' | 'semester' | 'role'>) {
  if (user.role !== 'student') return false;
  return Boolean(
    user.rollNumber?.trim() &&
      user.branch?.trim() &&
      user.semester &&
      user.semester >= 1
  );
}

/** Generate entry token only when roll, branch and semester are all set. */
export async function syncStudentEntryToken(user: IUser) {
  if (user.role !== 'student') return user;

  if (isStudentProfileComplete(user)) {
    if (!user.entryToken) {
      user.entryToken = randomUUID();
      await user.save();
    }
  } else if (user.entryToken) {
    user.set('entryToken', undefined);
    await user.save();
  }

  return user;
}

export function getStudentEntryUrl(user: IUser) {
  if (!isStudentProfileComplete(user) || !user.entryToken) return null;
  return buildEntryUrl(user.entryToken);
}

export function serializePublicProfile(user: IUser) {
  return {
    name: user.name,
    email: user.email,
    image: user.image || null,
    role: user.role,
    rollNumber: user.rollNumber || null,
    branch: user.branch || null,
    semester: user.semester ?? null,
  };
}
