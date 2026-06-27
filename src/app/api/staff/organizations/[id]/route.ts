import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Organization from '@/models/Organization';
import OrganizationMember from '@/models/OrganizationMember';
import { requireStaff } from '@/lib/auth-session';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await context.params;
    await connectDB();

    const org = await Organization.findById(id).lean();
    if (!org) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    const members = await OrganizationMember.find({ organizationId: id })
      .sort({ status: 1, joinedAt: -1 })
      .lean();

    const stats = {
      total: members.length,
      verified: members.filter((m) => m.status === 'verified').length,
      fake: members.filter((m) => m.status === 'fake').length,
      suspicious: members.filter((m) => m.status === 'suspicious').length,
      pending: members.filter((m) => m.status === 'pending').length,
    };

    return NextResponse.json({
      organization: {
        _id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        category: org.category,
        tagline: org.tagline,
        description: org.description,
        website: org.website,
        logo: org.logo,
        status: org.status,
      },
      members: members.map((m) => ({
        _id: m._id.toString(),
        name: m.name,
        email: m.email,
        rollNumber: m.rollNumber,
        branch: m.branch,
        status: m.status,
        flagReason: m.flagReason,
        joinedAt: m.joinedAt,
        userId: m.userId?.toString(),
      })),
      stats,
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching organization' }, { status: 500 });
  }
}
