import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Notice from '@/models/Notice';
import Timetable from '@/models/Timetable';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-session';
import { getSubjectsWithAttendance } from '@/lib/student-data';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const userId = session!.user.id;
    const isStaff = session!.user.role === 'staff';

    if (isStaff) {
      const [studentCount, assignmentCount, noticeCount, classCount] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        Assignment.countDocuments(),
        Notice.countDocuments(),
        Timetable.countDocuments(),
      ]);

      const recentStudents = await User.find({ role: 'student' })
        .select('name email rollNumber branch semester image createdAt')
        .sort({ createdAt: -1 });

      return NextResponse.json({
        stats: {
          studentCount,
          assignmentCount,
          noticeCount,
          classCount,
        },
        recentStudents,
      });
    }

    const totalAssignments = await Assignment.countDocuments();
    const submittedCount = await AssignmentSubmission.countDocuments({ studentId: userId });
    const assignmentsPending = Math.max(totalAssignments - submittedCount, 0);

    const subjects = await getSubjectsWithAttendance(userId);

    let totalClasses = 0;
    let totalAttendance = 0;
    subjects.forEach((sub) => {
      totalClasses += sub.totalClasses;
      totalAttendance += sub.attendance;
    });
    const attendancePercentage =
      totalClasses > 0 ? Math.round((totalAttendance / totalClasses) * 100) : 0;

    const newNoticesCount = await Notice.countDocuments();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const todaySchedule = await Timetable.find({ day: today })
      .populate('subjectId')
      .sort({ startTime: 1 });

    const upcomingAssignments = await Assignment.find()
      .sort({ dueDate: 1 })
      .limit(3)
      .lean();

    const submissions = await AssignmentSubmission.find({ studentId: userId }).lean();
    const submittedIds = new Set(submissions.map((s) => s.assignmentId.toString()));

    return NextResponse.json({
      stats: {
        assignmentsPending,
        attendancePercentage,
        newNoticesCount,
        upcomingClasses: todaySchedule.length,
        activeSubjects: subjects.length,
      },
      todaySchedule,
      upcomingAssignments: upcomingAssignments.map((a) => ({
        ...a,
        submitted: submittedIds.has(a._id.toString()),
      })),
      subjects,
    });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
