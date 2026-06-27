export const DEMO_GRADE_ROWS = [
  { courseCode: 'CS301', courseName: 'Data Structures & Algorithms', credits: 4, grade: 'A', semester: 'Semester 2024-25', status: 'Completed' },
  { courseCode: 'CS302', courseName: 'Database Management Systems', credits: 4, grade: 'A-', semester: 'Semester 2024-25', status: 'Completed' },
  { courseCode: 'CS303', courseName: 'Web Technologies', credits: 3, grade: 'B+', semester: 'Semester 2024-25', status: 'Completed' },
  { courseCode: 'MA201', courseName: 'Engineering Mathematics II', credits: 4, grade: 'A', semester: 'Semester 2023-24', status: 'Completed' },
  { courseCode: 'CS201', courseName: 'Object Oriented Programming', credits: 4, grade: 'A', semester: 'Semester 2023-24', status: 'Completed' },
];

export function gradeToPoints(grade: string) {
  const map: Record<string, number> = {
    A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2,
  };
  return map[grade] ?? 0;
}

export function computeGpa(grades: { grade: string; credits: number }[]) {
  if (grades.length === 0) return 0;
  const points = grades.reduce((sum, g) => sum + gradeToPoints(g.grade) * g.credits, 0);
  const credits = grades.reduce((sum, g) => sum + g.credits, 0);
  return credits > 0 ? points / credits : 0;
}

export function computeStats(grades: { grade: string; credits: number; semester: string }[], termSemester?: string) {
  const termGrades = termSemester
    ? grades.filter((g) => g.semester === termSemester)
    : grades;
  const termGpa = computeGpa(termGrades);
  const cumulativeGpa = computeGpa(grades);
  const earnedCredits = grades.reduce((sum, g) => sum + g.credits, 0);

  return {
    termGpa: termGpa.toFixed(2),
    cumulativeGpa: cumulativeGpa.toFixed(2),
    earnedCredits,
    standing: cumulativeGpa >= 3.5 ? "Dean's List" : 'Good Standing',
  };
}

const SEMESTER_ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

export type GpaChartPoint = {
  id: string;
  label: string;
  yourGPA: number;
  avgGPA: number;
};

export function buildGpaChartData(grades: { grade: string; credits: number; semester: string }[]): GpaChartPoint[] {
  const bySemester = new Map<string, typeof grades>();
  for (const grade of grades) {
    const list = bySemester.get(grade.semester) || [];
    list.push(grade);
    bySemester.set(grade.semester, list);
  }

  const sortedSemesters = [...bySemester.keys()].sort();
  let semesterGpas = sortedSemesters.map((semester) => ({
    semester,
    gpa: computeGpa(bySemester.get(semester)!),
  }));

  if (semesterGpas.length === 0) {
    semesterGpas = [
      { semester: 'Semester 1', gpa: 2.5 },
      { semester: 'Semester 2', gpa: 2.7 },
      { semester: 'Semester 3', gpa: 2.9 },
      { semester: 'Semester 4', gpa: 3.1 },
      { semester: 'Semester 5', gpa: 3.4 },
      { semester: 'Semester 6', gpa: 3.6 },
    ];
  } else if (semesterGpas.length < 6) {
    const actual = semesterGpas;
    const firstGpa = actual[0].gpa;
    const missing = 6 - actual.length;
    const earlier = Array.from({ length: missing }, (_, i) => ({
      semester: `Semester ${i + 1}`,
      gpa: Math.min(4, Math.max(1.5, firstGpa * (0.55 + (i + 1) / (missing + 1) * 0.35))),
    }));
    semesterGpas = [...earlier, ...actual];
  }

  const chart: GpaChartPoint[] = [];
  let id = 0;

  semesterGpas.slice(0, 6).forEach((sem, semIdx) => {
    const pointCount = semIdx === semesterGpas.length - 1 ? 2 : 4;
    for (let i = 0; i < pointCount; i++) {
      const jitter = (i - (pointCount - 1) / 2) * 0.08;
      const yourGPA = Math.min(4, Math.max(1, Number((sem.gpa + jitter).toFixed(2))));
      const avgGPA = Math.min(4, Math.max(1, Number((yourGPA * 0.88 + 0.25).toFixed(2))));
      chart.push({
        id: String(id++),
        label: `${SEMESTER_ORDINALS[semIdx]} Semester`,
        yourGPA,
        avgGPA,
      });
    }
  });

  return chart;
}

export function getGpaChartTicks(chart: GpaChartPoint[]): Record<string, string> {
  const ticks: Record<string, string> = {};
  for (const point of chart) {
    if (!Object.values(ticks).includes(point.label)) {
      ticks[point.id] = point.label;
    }
  }
  return ticks;
}
