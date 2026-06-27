import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import { requireAuth, requireStaff } from '@/lib/auth-session';
import { saveUpload } from '@/lib/upload';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const { id } = await params;
    await connectDB();

    await AssignmentSubmission.deleteMany({ assignmentId: id });
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Assignment deleted' });
  } catch {
    return NextResponse.json({ message: 'Error deleting assignment' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session!.user.role === 'staff') {
      return NextResponse.json({ message: 'Staff cannot submit assignments here' }, { status: 403 });
    }

    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ message: 'Please upload your assignment file' }, { status: 400 });
    }

    await connectDB();

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
    }

    let saved;
    try {
      saved = await saveUpload(file, 'submissions');
    } catch (uploadError) {
      return NextResponse.json(
        { message: uploadError instanceof Error ? uploadError.message : 'Upload failed' },
        { status: 400 }
      );
    }

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignmentId: id, studentId: session!.user.id },
      {
        fileUrl: saved.url,
        fileName: saved.fileName,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(submission, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error submitting assignment' }, { status: 500 });
  }
}
