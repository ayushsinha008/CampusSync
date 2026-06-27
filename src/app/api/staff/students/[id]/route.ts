import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Note from '@/models/Note';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Certificate from '@/models/Certificate';
import HousingAssignment from '@/models/HousingAssignment';
import Payment from '@/models/Payment';
import FinancialAid from '@/models/FinancialAid';
import { requireStaff } from '@/lib/auth-session';
import { getSubjectsWithAttendance } from '@/lib/student-data';
import { buildEntryUrl, ensureUserProfileFields } from '@/lib/user-profile';
import { ensureStudentGrades } from '@/lib/student-grades.server';
import { computeStats } from '@/lib/student-grades';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    let student = await User.findOne({ _id: id, role: 'student' }).select('-password');
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    await ensureUserProfileFields(student);
    student = await User.findById(id).select('-password');

    const [
      tasks,
      notes,
      subjects,
      grades,
      assignments,
      submissions,
      certificates,
      housing,
      payments,
      financialAid,
    ] = await Promise.all([
      Task.find({ userId: id }).sort({ createdAt: -1 }),
      Note.find({ userId: id }).sort({ updatedAt: -1 }),
      getSubjectsWithAttendance(id),
      ensureStudentGrades(id),
      Assignment.find().sort({ dueDate: -1 }).lean(),
      AssignmentSubmission.find({ studentId: id }).lean(),
      Certificate.find({ studentId: id }).sort({ awardedDate: -1 }),
      HousingAssignment.findOne({ studentId: id }),
      Payment.find({ studentId: id }).sort({ date: -1 }),
      FinancialAid.find({ studentId: id }),
    ]);

    let totalClasses = 0;
    let totalAttendance = 0;
    subjects.forEach((s) => {
      totalClasses += s.totalClasses;
      totalAttendance += s.attendance;
    });

    const gradeRows = grades.map((g) => ({
      _id: g._id.toString(),
      courseCode: g.courseCode,
      courseName: g.courseName,
      credits: g.credits,
      grade: g.grade,
      semester: g.semester,
      status: g.status,
    }));

    const semesters = [...new Set(gradeRows.map((g) => g.semester))].sort().reverse();
    const gradeStats = computeStats(gradeRows, semesters[0]);

    const submissionMap = new Map(
      submissions.map((s) => [s.assignmentId.toString(), s])
    );

    const assignmentActivity = assignments.map((a) => {
      const sub = submissionMap.get(a._id.toString());
      return {
        _id: a._id.toString(),
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate,
        priority: a.priority,
        submitted: !!sub,
        submittedAt: sub?.submittedAt || null,
        fileName: sub?.fileName || null,
      };
    });

    const entryToken = student!.entryToken!;
    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return NextResponse.json({
      student: {
        _id: student!._id.toString(),
        name: student!.name,
        email: student!.email,
        image: student!.image || null,
        rollNumber: student!.rollNumber,
        branch: student!.branch,
        semester: student!.semester,
        createdAt: student!.createdAt,
        entryToken,
        entryUrl: buildEntryUrl(entryToken),
        publicEntryUrl: `${origin.replace(/\/$/, '')}/entry/${entryToken}`,
      },
      attendance: {
        percentage: totalClasses > 0 ? Math.round((totalAttendance / totalClasses) * 100) : 0,
        attended: totalAttendance,
        totalClasses,
        subjects,
      },
      grades: gradeRows,
      gradeStats,
      assignments: assignmentActivity,
      submissionsCount: submissions.length,
      assignmentsTotal: assignments.length,
      certificates,
      housing,
      payments,
      financialAid,
      tasks,
      notes,
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching student data' }, { status: 500 });
  }
}
