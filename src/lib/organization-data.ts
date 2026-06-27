import Organization from '@/models/Organization';
import OrganizationMember from '@/models/OrganizationMember';
import User from '@/models/User';

export async function ensureOrganizations() {
  let org = await Organization.findOne({ slug: 'codezen' });
  if (!org) {
    org = await Organization.create({
      name: 'CodeZen',
      slug: 'codezen',
      tagline: 'Build · Develop · Grow',
      category: 'Coding Community',
      description:
        'CodeZen is a vibrant coding community on campus. We organize hackathons, coding workshops, peer learning sessions, and tech events.',
      website: 'https://officialcodezen.vercel.app/',
      logo: '/codezen-logo.png',
      status: 'active',
    });
  }

  const count = await OrganizationMember.countDocuments({ organizationId: org._id });
  if (count > 0) return org;

  const student = await User.findOne({ role: 'student' }).select('name email rollNumber branch');

  const members = [
    ...(student
      ? [
          {
            organizationId: org._id,
            userId: student._id,
            name: student.name,
            email: student.email,
            rollNumber: student.rollNumber,
            branch: student.branch,
            status: 'verified' as const,
            joinedAt: new Date('2025-08-01'),
          },
        ]
      : []),
    {
      organizationId: org._id,
      name: 'Rahul Fake Kumar',
      email: 'rahul.fake123@tempmail.com',
      status: 'fake' as const,
      flagReason: 'Disposable email domain · No roll number',
      joinedAt: new Date('2026-01-15'),
    },
    {
      organizationId: org._id,
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      status: 'fake' as const,
      flagReason: 'Not found in student registry',
      joinedAt: new Date('2026-02-02'),
    },
    {
      organizationId: org._id,
      name: 'Amit Bot',
      email: 'amit.bot@yopmail.com',
      status: 'fake' as const,
      flagReason: 'Bot-like name · External email',
      joinedAt: new Date('2026-02-10'),
    },
    {
      organizationId: org._id,
      name: 'Neha Gupta',
      email: 'neha.g@college.edu',
      rollNumber: 'FAKE-999',
      status: 'suspicious' as const,
      flagReason: 'Invalid roll number format',
      joinedAt: new Date('2026-02-18'),
    },
    {
      organizationId: org._id,
      name: 'Vikram Singh',
      email: 'vikram.singh@college.edu',
      rollNumber: 'CS2026-042',
      branch: 'Computer Science',
      status: 'pending' as const,
      joinedAt: new Date('2026-03-01'),
    },
    {
      organizationId: org._id,
      name: 'Sneha Reddy',
      email: 'sneha.r@college.edu',
      rollNumber: 'CS2026-088',
      branch: 'Computer Science',
      status: 'verified' as const,
      joinedAt: new Date('2025-11-20'),
    },
  ];

  await OrganizationMember.insertMany(members);
  return org;
}

export function memberStatusLabel(status: string) {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'fake':
      return 'Fake';
    case 'suspicious':
      return 'Suspicious';
    default:
      return 'Pending';
  }
}
