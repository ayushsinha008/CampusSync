import { randomUUID } from 'crypto';
import type { IUser } from '@/models/User';

export function buildEntryUrl(entryToken: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/entry/${entryToken}`;
}

export async function ensureUserProfileFields(user: IUser) {
  let changed = false;

  if (!user.entryToken) {
    user.entryToken = randomUUID();
    changed = true;
  }

  if (user.role === 'student') {
    if (!user.rollNumber) {
      const suffix = user._id.toString().slice(-4).toUpperCase();
      user.rollNumber = `CS2026-${suffix}`;
      changed = true;
    }
    if (!user.branch) {
      user.branch = 'Computer Science';
      changed = true;
    }
    if (!user.semester) {
      user.semester = 4;
      changed = true;
    }
  }

  if (changed) {
    await user.save();
  }

  return user;
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
