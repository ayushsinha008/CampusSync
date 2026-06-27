import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrganizationMember from '@/models/OrganizationMember';
import { requireStaff } from '@/lib/auth-session';

type RouteContext = { params: Promise<{ id: string }> };
type MemberStatus = 'verified' | 'fake' | 'pending' | 'suspicious';

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await context.params;
    const body = await req.json();
    const status = body.status as MemberStatus;
    const flagReason = body.flagReason as string | undefined;

    if (!['verified', 'fake', 'pending', 'suspicious'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const member = await OrganizationMember.findByIdAndUpdate(
      id,
      { status, ...(flagReason !== undefined ? { flagReason } : {}) },
      { new: true }
    ).lean();

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json({ message: 'Error updating member' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await context.params;
    await connectDB();

    const member = await OrganizationMember.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Error removing member' }, { status: 500 });
  }
}
