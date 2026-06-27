import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Organization from '@/models/Organization';
import OrganizationMember from '@/models/OrganizationMember';
import { requireAuth } from '@/lib/auth-session';
import { ensureOrganizations } from '@/lib/organization-data';

export async function GET() {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    await connectDB();
    await ensureOrganizations();

    const orgs = await Organization.find({ status: 'active' }).sort({ name: 1 }).lean();
    const orgIds = orgs.map((o) => o._id);

    const memberCounts = await OrganizationMember.aggregate([
      { $match: { organizationId: { $in: orgIds } } },
      { $group: { _id: '$organizationId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(memberCounts.map((r) => [r._id.toString(), r.count]));

    return NextResponse.json(
      orgs.map((o) => ({
        ...o,
        _id: o._id.toString(),
        members: countMap.get(o._id.toString()) ?? 0,
      }))
    );
  } catch {
    return NextResponse.json({ message: 'Error fetching organizations' }, { status: 500 });
  }
}
