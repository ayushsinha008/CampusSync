import { randomUUID } from 'crypto';
import User from '@/models/User';
import Teacher from '@/models/Teacher';
import Subject from '@/models/Subject';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import StudentAttendance from '@/models/StudentAttendance';
import Payment from '@/models/Payment';
import Notice from '@/models/Notice';
import Timetable from '@/models/Timetable';
import MaintenanceRequest from '@/models/MaintenanceRequest';

export async function ensureTeachersFromSubjects() {
  const count = await Teacher.countDocuments();
  if (count > 0) return;

  const subjects = await Subject.find({ faculty: { $exists: true, $ne: '' } });
  const facultyMap = new Map<string, string[]>();
  for (const s of subjects) {
    const name = s.faculty!.trim();
    const list = facultyMap.get(name) || [];
    list.push(s.name);
    facultyMap.set(name, list);
  }

  const statuses: Array<'Present' | 'On Leave' | 'Absent'> = ['Present', 'Present', 'Present', 'On Leave', 'Absent'];
  let i = 0;
  const rows = [...facultyMap.entries()].map(([name, subjectNames]) => ({
    name,
    department: 'Computer Science',
    email: `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@college.edu`,
    entryToken: randomUUID(),
    status: statuses[i++ % statuses.length],
    subjects: subjectNames,
  }));

  if (rows.length > 0) {
    await Teacher.insertMany(rows);
  }
}

export async function buildAdminAnalytics() {
  await ensureTeachersFromSubjects();

  const [
    studentCount,
    teachers,
    assignments,
    submissions,
    students,
    subjects,
    attendanceRows,
    pendingPayments,
    pendingAmountAgg,
    noticeCount,
    classCount,
    openTickets,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Teacher.find().sort({ name: 1 }),
    Assignment.find().sort({ dueDate: -1 }).lean(),
    AssignmentSubmission.find().lean(),
    User.find({ role: 'student' }).select('name email branch semester image createdAt').sort({ createdAt: -1 }),
    Subject.find().lean(),
    StudentAttendance.find().populate('subjectId', 'name').lean(),
    Payment.countDocuments({ status: 'Pending' }),
    Payment.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Notice.countDocuments(),
    Timetable.countDocuments(),
    MaintenanceRequest.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
  ]);

  const assignmentAnalytics = assignments.map((a) => {
    const submitted = submissions.filter((s) => s.assignmentId.toString() === a._id.toString()).length;
    return {
      id: a._id.toString(),
      title: a.title.length > 22 ? `${a.title.slice(0, 22)}…` : a.title,
      fullTitle: a.title,
      subject: a.subject,
      submitted,
      pending: Math.max(studentCount - submitted, 0),
      total: studentCount,
      rate: studentCount > 0 ? Math.round((submitted / studentCount) * 100) : 0,
    };
  });

  const totalSubmitted = submissions.length;
  const totalExpected = assignments.length * studentCount;
  const submissionRate = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;

  const branchMap = new Map<string, number>();
  for (const s of students) {
    const branch = s.branch || 'Unassigned';
    branchMap.set(branch, (branchMap.get(branch) || 0) + 1);
  }
  const studentsByBranch = [...branchMap.entries()].map(([branch, count]) => ({ branch, count }));

  const teacherStatus = {
    present: teachers.filter((t) => t.status === 'Present').length,
    onLeave: teachers.filter((t) => t.status === 'On Leave').length,
    absent: teachers.filter((t) => t.status === 'Absent').length,
  };

  const teacherAttendanceChart = teachers.map((t) => ({
    name: t.name.split(' ').pop() || t.name,
    fullName: t.name,
    status: t.status,
    value: t.status === 'Present' ? 1 : t.status === 'On Leave' ? 0.5 : 0,
  }));

  const subjectAttendanceMap = new Map<string, { attended: number; total: number }>();
  for (const row of attendanceRows) {
    const subject = row.subjectId as { name?: string } | null;
    const name = subject?.name || 'Unknown';
    const cur = subjectAttendanceMap.get(name) || { attended: 0, total: 0 };
    cur.attended += row.attendance || 0;
    cur.total += row.totalClasses || 0;
    subjectAttendanceMap.set(name, cur);
  }
  const attendanceBySubject = [...subjectAttendanceMap.entries()].map(([subject, v]) => ({
    subject: subject.length > 14 ? `${subject.slice(0, 14)}…` : subject,
    fullSubject: subject,
    percentage: v.total > 0 ? Math.round((v.attended / v.total) * 100) : 0,
    attended: v.attended,
    total: v.total,
  }));

  let campusAttendance = 0;
  const attTotal = attendanceRows.reduce((s, r) => s + (r.totalClasses || 0), 0);
  const attSum = attendanceRows.reduce((s, r) => s + (r.attendance || 0), 0);
  if (attTotal > 0) campusAttendance = Math.round((attSum / attTotal) * 100);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const enrollmentMap = new Map<string, number>();
  for (const s of students) {
    const d = new Date(s.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    enrollmentMap.set(key, (enrollmentMap.get(key) || 0) + 1);
  }
  let enrollmentTrend = [...enrollmentMap.entries()].map(([month, count]) => ({ month, students: count }));
  if (enrollmentTrend.length < 4) {
    const now = new Date();
    enrollmentTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const existing = enrollmentMap.get(key) || 0;
      return { month: monthNames[d.getMonth()], students: existing || (i === 5 ? studentCount : Math.max(1, studentCount - (5 - i))) };
    });
  }

  const semesterMap = new Map<number, number>();
  for (const s of students) {
    if (s.semester) semesterMap.set(s.semester, (semesterMap.get(s.semester) || 0) + 1);
  }
  const studentsBySemester = [...semesterMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([semester, count]) => ({ semester: `Sem ${semester}`, count }));

  return {
    stats: {
      studentCount,
      teacherCount: teachers.length,
      assignmentCount: assignments.length,
      submissionRate,
      campusAttendance,
      noticeCount,
      classCount,
      pendingPayments,
      pendingAmount: pendingAmountAgg[0]?.total || 0,
      openTickets,
    },
    assignmentAnalytics,
    studentsByBranch,
    studentsBySemester,
    teacherStatus,
    teacherAttendanceChart,
    teachers: teachers.map((t) => ({
      _id: t._id.toString(),
      name: t.name,
      department: t.department,
      status: t.status,
      subjects: t.subjects,
    })),
    attendanceBySubject,
    enrollmentTrend,
    recentStudents: students.slice(0, 10).map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      email: s.email,
      branch: s.branch,
      image: s.image,
      createdAt: s.createdAt,
      submissions: submissions.filter((sub) => sub.studentId.toString() === s._id.toString()).length,
      assignmentsTotal: assignments.length,
    })),
  };
}

export type AdminAnalytics = Awaited<ReturnType<typeof buildAdminAnalytics>>;

export function filterAnalyticsBySection(data: AdminAnalytics, section: string | null) {
  if (!section || section === 'full') return data;

  switch (section) {
    case 'overview':
      return {
        stats: data.stats,
        recentStudents: data.recentStudents,
      };
    case 'students':
      return {
        stats: { studentCount: data.stats.studentCount },
        enrollmentTrend: data.enrollmentTrend,
        studentsByBranch: data.studentsByBranch,
        studentsBySemester: data.studentsBySemester,
      };
    case 'teachers':
      return {
        stats: { teacherCount: data.stats.teacherCount },
        teacherStatus: data.teacherStatus,
        teachers: data.teachers,
      };
    case 'attendance':
      return {
        stats: { campusAttendance: data.stats.campusAttendance },
        attendanceBySubject: data.attendanceBySubject,
      };
    case 'assignments':
      return {
        stats: {
          assignmentCount: data.stats.assignmentCount,
          submissionRate: data.stats.submissionRate,
        },
        assignmentAnalytics: data.assignmentAnalytics,
      };
    default:
      return data;
  }
}
