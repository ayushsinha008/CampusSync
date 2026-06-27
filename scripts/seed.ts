import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Subject from '../src/models/Subject';
import Notice from '../src/models/Notice';
import StudentAttendance from '../src/models/StudentAttendance';
import Assignment from '../src/models/Assignment';
import AssignmentSubmission from '../src/models/AssignmentSubmission';
import Timetable from '../src/models/Timetable';
import Grade from '../src/models/Grade';
import Certificate from '../src/models/Certificate';
import FeeItem from '../src/models/FeeItem';
import Payment from '../src/models/Payment';
import FinancialAid from '../src/models/FinancialAid';
import HousingAssignment from '../src/models/HousingAssignment';
import CalendarEvent from '../src/models/CalendarEvent';
import Teacher from '../src/models/Teacher';
import Organization from '../src/models/Organization';
import OrganizationMember from '../src/models/OrganizationMember';
import Otp from '../src/models/Otp';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { ensureOrganizations } from '../src/lib/organization-data';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campussync';
const STAFF_EMAIL = (process.env.STAFF_EMAIL || 'staff@campus.sync').toLowerCase();
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || 'password123';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Notice.deleteMany({}),
      StudentAttendance.deleteMany({}),
      Assignment.deleteMany({}),
      AssignmentSubmission.deleteMany({}),
      Timetable.deleteMany({}),
      Grade.deleteMany({}),
      Certificate.deleteMany({}),
      FeeItem.deleteMany({}),
      Payment.deleteMany({}),
      FinancialAid.deleteMany({}),
      HousingAssignment.deleteMany({}),
      CalendarEvent.deleteMany({}),
      Teacher.deleteMany({}),
      Organization.deleteMany({}),
      OrganizationMember.deleteMany({}),
      Otp.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const staffPassword = await bcrypt.hash(STAFF_PASSWORD, 10);
    const staff = await User.create({
      name: 'Campus Admin',
      email: STAFF_EMAIL,
      password: staffPassword,
      role: 'staff',
      entryToken: randomUUID(),
    });

    const studentPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Ayush Sinha',
      email: 'student@college.edu',
      password: studentPassword,
      rollNumber: 'CS2026-001',
      branch: 'Computer Science',
      semester: 4,
      role: 'student',
      entryToken: randomUUID(),
    });
    console.log('Created users');

    const subjects = await Subject.create([
      { userId: staff._id, name: 'Data Structures', faculty: 'Dr. Sharma', room: 'Block A - 201' },
      { userId: staff._id, name: 'Web Development', faculty: 'Prof. Mehta', room: 'Lab 3' },
      { userId: staff._id, name: 'DBMS', faculty: 'Dr. Patel', room: 'Block B - 105' },
      { userId: staff._id, name: 'Machine Learning', faculty: 'Dr. Verma', room: 'AI Lab 1' },
      { userId: staff._id, name: 'Deep Learning', faculty: 'Prof. Singh', room: 'AI Lab 2' },
      { userId: staff._id, name: 'Python for AI', faculty: 'Dr. Sharma', room: 'Lab 4' },
      { userId: staff._id, name: 'Constitutional Law', faculty: 'Adv. Rao', room: 'Law Block - 101' },
      { userId: staff._id, name: 'Criminal Law', faculty: 'Adv. Iyer', room: 'Law Block - 102' },
      { userId: staff._id, name: 'Contract Law', faculty: 'Adv. Menon', room: 'Moot Court' },
    ]);

    await StudentAttendance.insertMany(
      subjects.map((subject: { _id: unknown }, i: number) => ({
        studentId: user._id,
        subjectId: subject._id,
        attendance: [30, 28, 40][i],
        totalClasses: [35, 30, 45][i],
      }))
    );

    await Timetable.insertMany([
      { userId: staff._id, subjectId: subjects[0]._id, department: 'engineering', program: 'cse', day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { userId: staff._id, subjectId: subjects[1]._id, department: 'engineering', program: 'cse', day: 'Tuesday', startTime: '11:00', endTime: '12:30' },
      { userId: staff._id, subjectId: subjects[2]._id, department: 'engineering', program: 'cse', day: 'Wednesday', startTime: '14:00', endTime: '15:30' },
      { userId: staff._id, subjectId: subjects[0]._id, department: 'engineering', program: 'cse', day: 'Friday', startTime: '10:00', endTime: '11:30' },
      { userId: staff._id, subjectId: subjects[3]._id, department: 'engineering', program: 'aiml', day: 'Monday', startTime: '10:00', endTime: '11:30' },
      { userId: staff._id, subjectId: subjects[4]._id, department: 'engineering', program: 'aiml', day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
      { userId: staff._id, subjectId: subjects[5]._id, department: 'engineering', program: 'aiml', day: 'Thursday', startTime: '14:00', endTime: '15:30' },
      { userId: staff._id, subjectId: subjects[6]._id, department: 'law', program: 'llb', day: 'Monday', startTime: '08:00', endTime: '09:30' },
      { userId: staff._id, subjectId: subjects[7]._id, department: 'law', program: 'llb', day: 'Tuesday', startTime: '10:00', endTime: '11:30' },
      { userId: staff._id, subjectId: subjects[8]._id, department: 'law', program: 'llb', day: 'Thursday', startTime: '11:00', endTime: '12:30' },
    ]);

    const due1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const due2 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await Assignment.insertMany([
      {
        createdBy: staff._id,
        subject: 'DBMS',
        title: 'Normalization & ER Diagram Assignment',
        description: 'Design ER diagram for a library system and normalize up to 3NF. Submit PDF report.',
        dueDate: due1,
        priority: 'High',
      },
      {
        createdBy: staff._id,
        subject: 'Web Development',
        title: 'Campus Portal Mini Project',
        description: 'Build a responsive student dashboard using React/Next.js. Upload source code as ZIP.',
        dueDate: due2,
        priority: 'Medium',
      },
    ]);

    const assignments = await Assignment.find();
    if (assignments[0]) {
      await AssignmentSubmission.create({
        assignmentId: assignments[0]._id,
        studentId: user._id,
        fileUrl: '/uploads/submissions/demo-assignment.pdf',
        fileName: 'demo-assignment.pdf',
        submittedAt: new Date(),
      });
    }

    await Teacher.insertMany([
      { name: 'Dr. Sharma', department: 'Computer Science', email: 'dr.sharma@college.edu', entryToken: randomUUID(), status: 'Present', subjects: ['Data Structures'] },
      { name: 'Prof. Mehta', department: 'Computer Science', email: 'prof.mehta@college.edu', entryToken: randomUUID(), status: 'Present', subjects: ['Web Development'] },
      { name: 'Dr. Patel', department: 'Computer Science', email: 'dr.patel@college.edu', entryToken: randomUUID(), status: 'On Leave', subjects: ['DBMS'] },
      { name: 'Dr. Verma', department: 'Electronics', email: 'dr.verma@college.edu', entryToken: randomUUID(), status: 'Present', subjects: ['Digital Electronics'] },
      { name: 'Prof. Singh', department: 'Mathematics', email: 'prof.singh@college.edu', entryToken: randomUUID(), status: 'Absent', subjects: ['Engineering Maths'] },
    ]);
    console.log('Created assignments, teachers & timetable');

    await Grade.insertMany([
      { studentId: user._id, courseCode: 'CS301', courseName: 'Data Structures & Algorithms', credits: 4, grade: 'A', semester: 'Semester 2024-25', status: 'Completed' },
      { studentId: user._id, courseCode: 'CS302', courseName: 'Database Management Systems', credits: 4, grade: 'A-', semester: 'Semester 2024-25', status: 'Completed' },
      { studentId: user._id, courseCode: 'CS303', courseName: 'Web Technologies', credits: 3, grade: 'B+', semester: 'Semester 2024-25', status: 'Completed' },
      { studentId: user._id, courseCode: 'MA201', courseName: 'Engineering Mathematics II', credits: 4, grade: 'A', semester: 'Semester 2023-24', status: 'Completed' },
      { studentId: user._id, courseCode: 'CS201', courseName: 'Object Oriented Programming', credits: 4, grade: 'A', semester: 'Semester 2023-24', status: 'Completed' },
    ]);

    await Certificate.insertMany([
      { studentId: user._id, title: "Dean's List - Semester 2024-25", issuer: 'College of Engineering', awardedDate: new Date('2025-01-15'), type: 'academic' },
      { studentId: user._id, title: 'AWS Cloud Foundations', issuer: 'AWS Academy India', awardedDate: new Date('2024-10-20'), type: 'professional' },
      { studentId: user._id, title: 'NSS Volunteer Excellence Award', issuer: 'University Administration', awardedDate: new Date('2024-05-10'), type: 'honor' },
    ]);

    const term = 'Semester 2025-26';
    await FeeItem.insertMany([
      { studentId: user._id, item: 'Semester Tuition Fee (Regular)', amount: 125000, category: 'Tuition', term },
      { studentId: user._id, item: 'Examination Fee', amount: 3500, category: 'Mandatory Fee', term },
      { studentId: user._id, item: 'Hostel & Mess Charges', amount: 45000, category: 'Hostel', term },
      { studentId: user._id, item: 'Library & Lab Fee', amount: 2500, category: 'Mandatory Fee', term },
    ]);

    await Payment.insertMany([
      { studentId: user._id, transactionId: 'TXN-IN-8821', date: new Date('2025-08-10'), description: 'Semester Tuition Fee (Paid)', amount: 125000, status: 'Paid' },
      { studentId: user._id, transactionId: 'TXN-IN-8822', date: new Date('2026-01-05'), description: 'Hostel & Mess Charges', amount: 45000, status: 'Pending' },
      { studentId: user._id, transactionId: 'TXN-IN-8823', date: new Date('2026-01-08'), description: 'Examination Fee', amount: 3500, status: 'Pending' },
    ]);

    await FinancialAid.insertMany([
      { studentId: user._id, name: 'Merit Scholarship (State)', amount: 50000, type: 'Scholarship', status: 'Accepted' },
      { studentId: user._id, name: 'Institutional Grant', amount: 25000, type: 'Grant', status: 'Accepted' },
      { studentId: user._id, name: 'Education Loan (Offered)', amount: 100000, type: 'Loan', status: 'Offered' },
    ]);

    await HousingAssignment.create({
      studentId: user._id,
      studentName: user.name,
      studentEmail: user.email,
      rollNumber: user.rollNumber,
      branch: user.branch,
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

    const { ensureHousingAssignments } = await import('../src/lib/housing-data');
    await ensureHousingAssignments();

    await Notice.create([
      { userId: staff._id, title: 'Internal Hackathon Registration Open', description: 'Register your team by this Friday.', category: 'Event', pinned: true },
      { userId: staff._id, title: 'Department Meeting on Friday', description: 'Mandatory meeting for all CS students.', category: 'Academic', pinned: false },
    ]);

    const now = new Date();
    await CalendarEvent.insertMany([
      { userId: user._id, title: 'DBMS Mid-Sem Exam', date: new Date(now.getFullYear(), now.getMonth(), 15), time: '10:00 AM', location: 'Block B - Hall 1', type: 'exam' },
      { userId: user._id, title: 'Coding Club Meetup', date: new Date(now.getFullYear(), now.getMonth(), 18), time: '4:00 PM', location: 'Student Activity Centre', type: 'club' },
      { userId: user._id, title: 'DBMS Assignment Due', date: due1, time: '11:59 PM', location: 'Online Portal', type: 'assignment' },
      { userId: user._id, title: 'Industry Guest Lecture', date: new Date(now.getFullYear(), now.getMonth(), 22), time: '2:00 PM', location: 'Main Auditorium', type: 'event' },
    ]);

    await ensureOrganizations();
    console.log('Created organizations with member audit data');

    console.log('Seed completed successfully!');
    console.log('Student login: student@college.edu / password123');
    console.log('Staff login:', STAFF_EMAIL, '/', STAFF_PASSWORD);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
