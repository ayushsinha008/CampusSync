import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HousingAssignment from '@/models/HousingAssignment';
import { requireStaff } from '@/lib/auth-session';

type RouteContext = { params: Promise<{ id: string }> };
type HousingStatus = 'verified' | 'fake' | 'suspicious' | 'pending';

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await context.params;
    const body = await req.json();
    const verificationStatus = body.verificationStatus as HousingStatus;
    const flagReason = body.flagReason as string | undefined;

    if (!['verified', 'fake', 'suspicious', 'pending'].includes(verificationStatus)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const assignment = await HousingAssignment.findByIdAndUpdate(
      id,
      {
        verificationStatus,
        ...(flagReason !== undefined ? { flagReason } : {}),
      },
      { new: true }
    ).lean();

    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch {
    return NextResponse.json({ message: 'Error updating assignment' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await context.params;
    await connectDB();

    const assignment = await HousingAssignment.findByIdAndDelete(id);
    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Error removing assignment' }, { status: 500 });
  }
}
