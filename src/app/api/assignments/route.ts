import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import { requireAuth, requireStaff } from '@/lib/auth-session';
import { saveUpload } from '@/lib/upload';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const assignments = await Assignment.find()
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 })
      .lean();

    if (session!.user.role === 'staff') {
      const submissions = await AssignmentSubmission.find()
        .populate('studentId', 'name email')
        .lean();

      const byAssignment = submissions.reduce<Record<string, typeof submissions>>((acc, sub) => {
        const key = sub.assignmentId.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(sub);
        return acc;
      }, {});

      return NextResponse.json(
        assignments.map((a) => ({
          ...a,
          submissions: byAssignment[a._id.toString()] || [],
          submissionCount: (byAssignment[a._id.toString()] || []).length,
        }))
      );
    }

    const mySubmissions = await AssignmentSubmission.find({ studentId: session!.user.id }).lean();
    const submissionMap = new Map(mySubmissions.map((s) => [s.assignmentId.toString(), s]));

    return NextResponse.json(
      assignments.map((a) => ({
        ...a,
        submission: submissionMap.get(a._id.toString()) || null,
        submitted: !!submissionMap.get(a._id.toString()),
      }))
    );
  } catch {
    return NextResponse.json({ message: 'Error fetching assignments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireStaff();
    if (error) return error;

    const formData = await req.formData();
    const title = formData.get('title')?.toString().trim();
    const subject = formData.get('subject')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const dueDate = formData.get('dueDate')?.toString();
    const priority = formData.get('priority')?.toString() as 'Low' | 'Medium' | 'High' | undefined;
    const file = formData.get('file') as File | null;

    if (!title || !subject || !dueDate) {
      return NextResponse.json({ message: 'Title, subject, and due date are required' }, { status: 400 });
    }

    await connectDB();

    let attachmentUrl: string | undefined;
    let attachmentFileName: string | undefined;

    if (file && file.size > 0) {
      try {
        const saved = await saveUpload(file, 'teacher');
        attachmentUrl = saved.url;
        attachmentFileName = saved.fileName;
      } catch (uploadError) {
        return NextResponse.json(
          { message: uploadError instanceof Error ? uploadError.message : 'Upload failed' },
          { status: 400 }
        );
      }
    }

    const assignment = await Assignment.create({
      createdBy: session!.user.id,
      title,
      subject,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      attachmentUrl,
      attachmentFileName,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error creating assignment' }, { status: 500 });
  }
}
