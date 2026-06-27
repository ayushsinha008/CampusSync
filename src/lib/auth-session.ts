import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireStaff() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (session!.user.role !== 'staff') {
    return { session: null, error: NextResponse.json({ message: 'Forbidden: Staff access required' }, { status: 403 }) };
  }
  return { session, error: null };
}
