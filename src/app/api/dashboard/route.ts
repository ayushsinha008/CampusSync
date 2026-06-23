import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Notice from '@/models/Notice';
import Subject from '@/models/Subject';
import Timetable from '@/models/Timetable';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    // Get tasks due soon
    const tasksDue = await Task.countDocuments({ userId, completed: false });

    // Get attendance stats
    const subjects = await Subject.find({ userId });
    let totalClasses = 0;
    let totalAttendance = 0;
    subjects.forEach(sub => {
      totalClasses += sub.totalClasses;
      totalAttendance += sub.attendance;
    });
    const attendancePercentage = totalClasses > 0 ? Math.round((totalAttendance / totalClasses) * 100) : 100;

    // Get new notices
    const newNoticesCount = await Notice.countDocuments({ userId });

    // Get today's schedule
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    const todaySchedule = await Timetable.find({ userId, day: today })
      .populate('subjectId')
      .sort({ startTime: 1 });

    const upcomingTasks = await Task.find({ userId, completed: false })
      .sort({ deadline: 1 })
      .limit(3);

    return NextResponse.json({
      stats: {
        tasksDue,
        attendancePercentage,
        newNoticesCount,
        upcomingClasses: todaySchedule.length,
      },
      todaySchedule,
      upcomingTasks
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
