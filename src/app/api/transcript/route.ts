import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Grade from '@/models/Grade';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-session';

function gradeToPoints(grade: string) {
  const map: Record<string, number> = {
    A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2,
  };
  return map[grade] ?? 0;
}

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const [grades, user] = await Promise.all([
      Grade.find({ studentId: session!.user.id }).sort({ semester: -1 }),
      User.findById(session!.user.id).select('name branch rollNumber'),
    ]);

    const bySemester = grades.reduce<Record<string, typeof grades>>((acc, g) => {
      if (!acc[g.semester]) acc[g.semester] = [];
      acc[g.semester].push(g);
      return acc;
    }, {});

    const terms = Object.entries(bySemester).map(([semester, courses]) => {
      const credits = courses.reduce((s, c) => s + c.credits, 0);
      const gpa =
        credits > 0
          ? (
              courses.reduce((s, c) => s + gradeToPoints(c.grade) * c.credits, 0) / credits
            ).toFixed(2)
          : '0.00';
      return { semester, gpa: parseFloat(gpa), credits, courses };
    });

    const allCredits = grades.reduce((s, g) => s + g.credits, 0);
    const cumulativeGpa =
      allCredits > 0
        ? (
            grades.reduce((s, g) => s + gradeToPoints(g.grade) * g.credits, 0) / allCredits
          ).toFixed(2)
        : '0.00';

    return NextResponse.json({
      student: user,
      terms,
      cumulativeGpa,
      degree: user?.branch || 'Computer Science',
      standing: parseFloat(cumulativeGpa) >= 3.5 ? 'In Good Standing' : 'In Good Standing',
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching transcript' }, { status: 500 });
  }
}
