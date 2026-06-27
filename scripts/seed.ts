import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Subject from '../src/models/Subject';
import Task from '../src/models/Task';
import Notice from '../src/models/Notice';
import StudentAttendance from '../src/models/StudentAttendance';
import Otp from '../src/models/Otp';
import dotenv from 'dotenv';

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
      Task.deleteMany({}),
      Notice.deleteMany({}),
      StudentAttendance.deleteMany({}),
      Otp.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const staffPassword = await bcrypt.hash(STAFF_PASSWORD, 10);
    const staff = await User.create({
      name: 'Admin Staff',
      email: STAFF_EMAIL,
      password: staffPassword,
      role: 'staff',
    });
    console.log('Created staff:', staff.email);

    const studentPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'John Student',
      email: 'student@college.edu',
      password: studentPassword,
      rollNumber: 'CS2026-001',
      branch: 'Computer Science',
      semester: 4,
      role: 'student',
    });
    console.log('Created student:', user.email);

    const subjects = await Subject.create([
      { userId: staff._id, name: 'Data Structures', faculty: 'Dr. Smith', room: '201' },
      { userId: staff._id, name: 'Web Development', faculty: 'Prof. Johnson', room: 'Lab 3' },
      { userId: staff._id, name: 'DBMS', faculty: 'Dr. Williams', room: '105' },
    ]);
    console.log('Created subjects');

    await StudentAttendance.insertMany(
      subjects.map((subject: { _id: unknown }, i: number) => ({
        studentId: user._id,
        subjectId: subject._id,
        attendance: [30, 28, 40][i],
        totalClasses: [35, 30, 45][i],
      }))
    );
    console.log('Created student attendance records');

    await Task.create([
      { userId: user._id, title: 'DBMS Assignment', priority: 'High', completed: false, deadline: new Date() },
      { userId: user._id, title: 'Web Project', priority: 'Medium', completed: false, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { userId: user._id, title: 'Lab Record', priority: 'Low', completed: false, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { userId: user._id, title: 'Read Chapter 4', priority: 'Medium', completed: true },
    ]);
    console.log('Created tasks');

    await Notice.create([
      { userId: staff._id, title: 'Internal Hackathon Registration Open', description: 'Register your team by this Friday.', category: 'Event', pinned: true },
      { userId: staff._id, title: 'Department Meeting on Friday', description: 'Mandatory meeting for all CS students.', category: 'Academic', pinned: false },
    ]);
    console.log('Created notices');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
