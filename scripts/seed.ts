import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Subject from '../src/models/Subject';
import Task from '../src/models/Task';
import Notice from '../src/models/Notice';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campussync';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Task.deleteMany({});
    await Notice.deleteMany({});
    console.log('Cleared existing data');

    // Create a user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'John Student',
      email: 'student@college.edu',
      password: hashedPassword,
      rollNumber: 'CS2026-001',
      branch: 'Computer Science',
      semester: 4,
    });
    console.log('Created user:', user.email);

    // Create subjects
    await Subject.create([
      { userId: user._id, name: 'Data Structures', faculty: 'Dr. Smith', room: '201', attendance: 30, totalClasses: 35 },
      { userId: user._id, name: 'Web Development', faculty: 'Prof. Johnson', room: 'Lab 3', attendance: 28, totalClasses: 30 },
      { userId: user._id, name: 'DBMS', faculty: 'Dr. Williams', room: '105', attendance: 40, totalClasses: 45 },
    ]);
    console.log('Created subjects');

    // Create tasks
    await Task.create([
      { userId: user._id, title: 'DBMS Assignment', priority: 'High', completed: false, deadline: new Date() },
      { userId: user._id, title: 'Web Project', priority: 'Medium', completed: false, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { userId: user._id, title: 'Lab Record', priority: 'Low', completed: false, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { userId: user._id, title: 'Read Chapter 4', priority: 'Medium', completed: true },
    ]);
    console.log('Created tasks');

    // Create notices
    await Notice.create([
      { userId: user._id, title: 'Internal Hackathon Registration Open', description: 'Register your team by this Friday.', category: 'Event', pinned: true },
      { userId: user._id, title: 'Department Meeting on Friday', description: 'Mandatory meeting for all CS students.', category: 'Academic', pinned: false },
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
