import HousingAssignment from '@/models/HousingAssignment';
import User from '@/models/User';

export async function ensureHousingAssignments() {
  const fakeCount = await HousingAssignment.countDocuments({
    verificationStatus: { $in: ['fake', 'suspicious'] },
  });
  if (fakeCount > 0) return;

  const student = await User.findOne({ role: 'student' }).select('name email rollNumber branch');

  if (student) {
    const existing = await HousingAssignment.findOne({ studentId: student._id });
    if (existing) {
      existing.studentName = student.name;
      existing.studentEmail = student.email;
      existing.rollNumber = student.rollNumber;
      existing.branch = student.branch;
      existing.verificationStatus = 'verified';
      await existing.save();
    } else {
      await HousingAssignment.create({
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        rollNumber: student.rollNumber,
        branch: student.branch,
        building: 'Vivekananda Hostel',
        location: 'North Campus',
        room: '412-B',
        roomType: 'Double Sharing',
        status: 'Assigned',
        term: '2025-26',
        roommateName: 'Rahul Verma',
        roommateMajor: 'Electronics & Communication',
        verificationStatus: 'verified',
      });
    }
  }

  await HousingAssignment.insertMany([
    {
      studentName: 'Rahul Fake Kumar',
      studentEmail: 'rahul.fake@tempmail.com',
      building: 'Vivekananda Hostel',
      location: 'North Campus',
      room: '412-B',
      roomType: 'Double Sharing',
      status: 'Assigned',
      term: '2025-26',
      verificationStatus: 'fake',
      flagReason: 'Same room assigned twice · No roll number · Disposable email',
    },
    {
      studentName: 'Priya Unknown',
      studentEmail: 'priya.xyz@gmail.com',
      rollNumber: 'FAKE-001',
      building: 'Tagore Hostel',
      location: 'South Campus',
      room: '201-A',
      roomType: 'Single',
      status: 'Assigned',
      term: '2025-26',
      verificationStatus: 'fake',
      flagReason: 'Not in student registry · Invalid roll format',
    },
    {
      studentName: 'Amit Ghost',
      studentEmail: 'amit@yopmail.com',
      building: 'Vivekananda Hostel',
      location: 'North Campus',
      room: '999-Z',
      roomType: 'Triple Sharing',
      status: 'Assigned',
      term: '2025-26',
      verificationStatus: 'fake',
      flagReason: 'Room does not exist in hostel block',
    },
    {
      studentName: 'Neha Gupta',
      studentEmail: 'neha.g@college.edu',
      rollNumber: 'CS2026-999',
      branch: 'Computer Science',
      building: 'Tagore Hostel',
      location: 'South Campus',
      room: '305-C',
      roomType: 'Double Sharing',
      status: 'Pending',
      term: '2025-26',
      verificationStatus: 'suspicious',
      flagReason: 'Roll number not found in active enrollment',
    },
    {
      studentName: 'Vikram Singh',
      studentEmail: 'vikram.singh@college.edu',
      rollNumber: 'CS2026-042',
      branch: 'Computer Science',
      building: 'Netaji Hostel',
      location: 'East Campus',
      room: '118-A',
      roomType: 'Double Sharing',
      status: 'Pending',
      term: '2025-26',
      verificationStatus: 'pending',
    },
  ]);
}
