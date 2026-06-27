import { NextResponse } from 'next/server';
import { ACADEMIC_CATALOG } from '@/lib/academic-catalog';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  return NextResponse.json(ACADEMIC_CATALOG);
}
