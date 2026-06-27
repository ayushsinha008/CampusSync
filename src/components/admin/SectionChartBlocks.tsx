'use client';

import { useStaffAnalytics, AnalyticsSkeleton } from '@/hooks/useStaffAnalytics';
import {
  EnrollmentAreaChart,
  BranchPieChart,
  SemesterRadialChart,
  TeacherDonutChart,
  TeacherStatusBarChart,
  AttendanceRadarChart,
  AttendanceLineChart,
  AssignmentStackedChart,
  SubmissionRateDonut,
  AssignmentPriorityChart,
} from '@/components/admin/ChartKit';

type StudentAnalytics = {
  enrollmentTrend: Array<{ month: string; students: number }>;
  studentsByBranch: Array<{ branch: string; count: number }>;
  studentsBySemester: Array<{ semester: string; count: number }>;
};

type TeacherAnalytics = {
  teacherStatus: { present: number; onLeave: number; absent: number };
  teachers: Array<{ name: string; status: string }>;
};

type AttendanceAnalytics = {
  attendanceBySubject: Array<{ subject: string; percentage: number }>;
  stats: { campusAttendance: number };
};

type AssignmentAnalytics = {
  assignmentAnalytics: Array<{ title: string; submitted: number; pending: number; rate: number }>;
  stats: { submissionRate: number; assignmentCount: number };
};

export function StudentSectionCharts() {
  const { data, loading } = useStaffAnalytics<StudentAnalytics>('students');
  if (loading) return <AnalyticsSkeleton />;
  if (!data) return null;

  const branch = data.studentsByBranch.length > 0 ? data.studentsByBranch : [{ branch: 'No data', count: 0 }];
  const semester = data.studentsBySemester.length > 0 ? data.studentsBySemester : [{ semester: 'N/A', count: 0 }];

  return (
    <div className="space-y-5">
      <EnrollmentAreaChart data={data.enrollmentTrend} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BranchPieChart data={branch} />
        <SemesterRadialChart data={semester} />
      </div>
    </div>
  );
}

export function TeacherSectionCharts() {
  const { data, loading } = useStaffAnalytics<TeacherAnalytics>('teachers');
  if (loading) return <AnalyticsSkeleton />;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <TeacherDonutChart data={data.teacherStatus} />
      <TeacherStatusBarChart teachers={data.teachers} />
    </div>
  );
}

export function AttendanceSectionCharts() {
  const { data, loading } = useStaffAnalytics<AttendanceAnalytics>('attendance');
  if (loading) return <AnalyticsSkeleton />;
  if (!data?.attendanceBySubject?.length) return null;

  const chartData = data.attendanceBySubject.map((d) => ({
    subject: d.subject,
    percentage: d.percentage,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <AttendanceRadarChart data={chartData} />
      <AttendanceLineChart data={chartData} />
    </div>
  );
}

export function AssignmentSectionCharts() {
  const { data, loading } = useStaffAnalytics<AssignmentAnalytics>('assignments');
  if (loading) return <AnalyticsSkeleton />;
  if (!data) return null;

  const chartData = data.assignmentAnalytics.map((a) => ({
    title: a.title,
    submitted: a.submitted,
    pending: a.pending,
    rate: a.rate,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AssignmentStackedChart data={chartData} />
        <SubmissionRateDonut rate={data.stats.submissionRate} total={data.stats.assignmentCount} />
      </div>
      <AssignmentPriorityChart data={chartData} />
    </div>
  );
}
