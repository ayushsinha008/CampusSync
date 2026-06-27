import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Organization from '@/models/Organization';
import OrganizationMember from '@/models/OrganizationMember';
import { requireStaff } from '@/lib/auth-session';
import { ensureOrganizations } from '@/lib/organization-data';

export async function GET() {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    await connectDB();
    await ensureOrganizations();

    const orgs = await Organization.find().sort({ name: 1 }).lean();

    const orgsWithStats = await Promise.all(
      orgs.map(async (org) => {
        const members = await OrganizationMember.find({ organizationId: org._id }).lean();
        return {
          _id: org._id.toString(),
          name: org.name,
          slug: org.slug,
          category: org.category,
          tagline: org.tagline,
          status: org.status,
          logo: org.logo,
          stats: {
            total: members.length,
            verified: members.filter((m) => m.status === 'verified').length,
            fake: members.filter((m) => m.status === 'fake').length,
            suspicious: members.filter((m) => m.status === 'suspicious').length,
            pending: members.filter((m) => m.status === 'pending').length,
          },
        };
      })
    );

    const totals = orgsWithStats.reduce(
      (acc, o) => ({
        organizations: acc.organizations + 1,
        members: acc.members + o.stats.total,
        verified: acc.verified + o.stats.verified,
        fake: acc.fake + o.stats.fake + o.stats.suspicious,
        pending: acc.pending + o.stats.pending,
      }),
      { organizations: 0, members: 0, verified: 0, fake: 0, pending: 0 }
    );

    return NextResponse.json({ organizations: orgsWithStats, totals });
  } catch {
    return NextResponse.json({ message: 'Error fetching organizations' }, { status: 500 });
  }
}
