import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HousingAssignment from '@/models/HousingAssignment';
import MaintenanceRequest from '@/models/MaintenanceRequest';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();
    const [assignment, requests] = await Promise.all([
      HousingAssignment.findOne({ studentId: session!.user.id }),
      MaintenanceRequest.find({ studentId: session!.user.id }).sort({ createdAt: -1 }).limit(5),
    ]);

    return NextResponse.json({ assignment, requests });
  } catch {
    return NextResponse.json({ message: 'Error fetching housing data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { category, description } = await req.json();
    if (!category?.trim() || !description?.trim()) {
      return NextResponse.json({ message: 'Category and description are required' }, { status: 400 });
    }

    await connectDB();
    const ticketId = `MR-${Math.floor(1000 + Math.random() * 9000)}`;

    const request = await MaintenanceRequest.create({
      studentId: session!.user.id,
      ticketId,
      category: category.trim(),
      description: description.trim(),
      status: 'Open',
    });

    return NextResponse.json(request, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Error submitting request' }, { status: 500 });
  }
}
