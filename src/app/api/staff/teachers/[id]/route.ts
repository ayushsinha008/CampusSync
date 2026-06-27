import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import Subject from '@/models/Subject';
import StudentAttendance from '@/models/StudentAttendance';
import User from '@/models/User';
import Assignment from '@/models/Assignment';
import { requireStaff } from '@/lib/auth-session';
import { ensureTeacherEntryToken, buildFacultyEntryUrl } from '@/lib/teacher-profile';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await context.params;
    await connectDB();

    const teacherDoc = await ensureTeacherEntryToken(id);
    if (!teacherDoc) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }
    const teacher = teacherDoc.toObject();

    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const publicFacultyUrl = `${origin.replace(/\/$/, '')}/entry/${teacherDoc.entryToken}`;

    const subjects = await Subject.find({ faculty: teacher.name }).lean();
    const subjectIds = subjects.map((s) => s._id);

    const attendanceRows =
      subjectIds.length > 0
        ? await StudentAttendance.find({ subjectId: { $in: subjectIds } }).lean()
        : [];

    const studentIds = [...new Set(attendanceRows.map((r) => r.studentId.toString()))];
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' })
      .select('name email image rollNumber branch semester')
      .lean();

    const assignments = await Assignment.find({
      subject: { $in: subjects.map((s) => s.name) },
    })
      .sort({ dueDate: -1 })
      .limit(10)
      .lean();

    let totalClasses = 0;
    let totalAttended = 0;
    attendanceRows.forEach((r) => {
      totalClasses += r.totalClasses ?? 0;
      totalAttended += r.attendance ?? 0;
    });

    return NextResponse.json({
      teacher: {
        _id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        status: teacher.status,
        subjects: teacher.subjects,
        createdAt: teacher.createdAt,
        publicFacultyUrl,
        entryUrl: buildFacultyEntryUrl(teacherDoc.entryToken!),
      },
      subjects: subjects.map((s) => ({
        _id: s._id.toString(),
        name: s.name,
        room: s.room,
        faculty: s.faculty,
      })),
      students: students.map((s) => ({ ...s, _id: s._id.toString() })),
      assignments: assignments.map((a) => ({
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate,
        priority: a.priority,
      })),
      stats: {
        subjectCount: subjects.length,
        studentCount: students.length,
        assignmentCount: assignments.length,
        campusAttendancePct:
          totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching teacher' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await context.params;
    const body = await req.json();
    const status = body.status as string;

    if (!['Present', 'On Leave', 'Absent'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const teacher = await Teacher.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!teacher) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch {
    return NextResponse.json({ message: 'Error updating teacher' }, { status: 500 });
  }
}
