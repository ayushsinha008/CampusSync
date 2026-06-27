import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Grade from '@/models/Grade';
import Notice from '@/models/Notice';
import Assignment from '@/models/Assignment';
import Subject from '@/models/Subject';
import { requireAuth } from '@/lib/auth-session';

const NAV_PAGES = [
  { label: 'Dashboard', href: '/dashboard', tags: ['dashboard', 'home'] },
  { label: 'My Class', href: '/attendance', tags: ['attendance', 'class'] },
  { label: 'Class Schedule', href: '/timetable', tags: ['timetable', 'schedule'] },
  { label: 'Grades & Transcript', href: '/grades', tags: ['grades', 'gpa', 'transcript'] },
  { label: 'Assignments', href: '/tasks', tags: ['assignments', 'tasks', 'homework'] },
  { label: 'Academic Calendar', href: '/calendar', tags: ['calendar', 'events'] },
  { label: 'Official Transcript', href: '/transcript', tags: ['transcript'] },
  { label: 'Certificates', href: '/certificates', tags: ['certificates', 'awards'] },
  { label: 'Tuition & Fees', href: '/tuition', tags: ['tuition', 'fees'] },
  { label: 'Payment History', href: '/payments', tags: ['payments', 'billing'] },
  { label: 'Financial Aid', href: '/financial-aid', tags: ['scholarship', 'aid'] },
  { label: 'Organizations', href: '/organizations', tags: ['clubs', 'organizations'] },
  { label: 'Notice Board', href: '/notices', tags: ['notices', 'announcements'] },
  { label: 'Housing', href: '/housing', tags: ['hostel', 'housing'] },
  { label: 'My Profile', href: '/profile', tags: ['profile', 'account'] },
];

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const q = new URL(req.url).searchParams.get('q')?.trim().toLowerCase() || '';
    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    await connectDB();
    const userId = session!.user.id;

    const [grades, notices, assignments, subjects] = await Promise.all([
      Grade.find({
        studentId: userId,
        $or: [
          { courseCode: { $regex: q, $options: 'i' } },
          { courseName: { $regex: q, $options: 'i' } },
        ],
      }).limit(5),
      Notice.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ],
      }).limit(5),
      Assignment.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { subject: { $regex: q, $options: 'i' } },
        ],
      }).limit(5),
      Subject.find({ name: { $regex: q, $options: 'i' } }).limit(5),
    ]);

    const pageHits = NAV_PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q) || q.includes(t))
    ).map((p) => ({
      type: 'page' as const,
      title: p.label,
      subtitle: 'Go to page',
      href: p.href,
    }));

    const results = [
      ...pageHits,
      ...grades.map((g) => ({
        type: 'grade' as const,
        title: g.courseName,
        subtitle: `${g.courseCode} · Grade ${g.grade}`,
        href: '/grades',
      })),
      ...assignments.map((a) => ({
        type: 'assignment' as const,
        title: a.title,
        subtitle: a.subject,
        href: '/tasks',
      })),
      ...notices.map((n) => ({
        type: 'notice' as const,
        title: n.title,
        subtitle: n.category,
        href: '/notices',
      })),
      ...subjects.map((s) => ({
        type: 'subject' as const,
        title: s.name,
        subtitle: s.faculty || 'Subject',
        href: '/timetable',
      })),
    ].slice(0, 10);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ message: 'Search failed' }, { status: 500 });
  }
}
