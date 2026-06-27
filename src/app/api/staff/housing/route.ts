import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HousingAssignment from '@/models/HousingAssignment';
import MaintenanceRequest from '@/models/MaintenanceRequest';
import { requireStaff } from '@/lib/auth-session';
import { ensureHousingAssignments } from '@/lib/housing-data';

export async function GET() {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    await connectDB();
    await ensureHousingAssignments();

    const assignments = await HousingAssignment.find().sort({ verificationStatus: 1, createdAt: -1 }).lean();

    const stats = {
      total: assignments.length,
      verified: assignments.filter((a) => a.verificationStatus === 'verified').length,
      fake: assignments.filter((a) => a.verificationStatus === 'fake').length,
      suspicious: assignments.filter((a) => a.verificationStatus === 'suspicious').length,
      pending: assignments.filter((a) => a.verificationStatus === 'pending').length,
      openTickets: await MaintenanceRequest.countDocuments({ status: 'Open' }),
    };

    return NextResponse.json({
      stats,
      assignments: assignments.map((a) => ({
        _id: a._id.toString(),
        studentName: a.studentName,
        studentEmail: a.studentEmail,
        rollNumber: a.rollNumber,
        branch: a.branch,
        building: a.building,
        location: a.location,
        room: a.room,
        roomType: a.roomType,
        status: a.status,
        term: a.term,
        roommateName: a.roommateName,
        verificationStatus: a.verificationStatus,
        flagReason: a.flagReason,
        studentId: a.studentId?.toString(),
      })),
    });
  } catch {
    return NextResponse.json({ message: 'Error fetching housing data' }, { status: 500 });
  }
}
