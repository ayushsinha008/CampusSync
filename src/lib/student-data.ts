import Subject from '@/models/Subject';
import StudentAttendance from '@/models/StudentAttendance';

export async function ensureStudentEnrollments(studentId: string) {
  const subjects = await Subject.find().select('_id');
  if (subjects.length === 0) return;

  const ops = subjects.map((subject) => ({
    updateOne: {
      filter: { studentId, subjectId: subject._id },
      update: { $setOnInsert: { attendance: 0, totalClasses: 0 } },
      upsert: true,
    },
  }));

  await StudentAttendance.bulkWrite(ops, { ordered: false });
}

export async function getSubjectsWithAttendance(studentId: string) {
  const records = await StudentAttendance.find({ studentId }).lean();
  if (records.length === 0) return [];

  const subjectIds = records.map((r) => r.subjectId);
  const subjects = await Subject.find({ _id: { $in: subjectIds } }).sort({ createdAt: -1 }).lean();
  const recordMap = new Map(records.map((r) => [r.subjectId.toString(), r]));

  return subjects.map((subject) => {
    const record = recordMap.get(subject._id.toString());
    return {
      ...subject,
      attendance: record?.attendance ?? 0,
      totalClasses: record?.totalClasses ?? 0,
    };
  });
}
