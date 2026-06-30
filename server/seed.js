import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import ClassRoom from './models/ClassRoom.js';
import Assignment from './models/Assignment.js';
import Lecture from './models/Lecture.js';
import Announcement from './models/Announcement.js';
import Attendance from './models/Attendance.js';
import Fee from './models/Fee.js';
import Note from './models/Note.js';

dotenv.config();

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    ClassRoom.deleteMany(),
    Assignment.deleteMany(),
    Lecture.deleteMany(),
    Announcement.deleteMany(),
    Attendance.deleteMany(),
    Fee.deleteMany(),
    Note.deleteMany(),
  ]);

  console.log('Creating users...');
  // NOTE: password hashing happens in the model pre-save hook, so we use .create
  const admin = await User.create({
    name: 'Aisha Verma',
    email: 'admin@school.edu',
    password: 'password123',
    role: 'admin',
    phone: '+91 98765 43210',
  });

  const teacher1 = await User.create({
    name: 'Rajesh Kumar',
    email: 'teacher@school.edu',
    password: 'password123',
    role: 'teacher',
    employeeId: 'EMP-1001',
    department: 'Science',
    subjects: ['Physics', 'Mathematics'],
  });

  const teacher2 = await User.create({
    name: 'Priya Nair',
    email: 'priya@school.edu',
    password: 'password123',
    role: 'teacher',
    employeeId: 'EMP-1002',
    department: 'Languages',
    subjects: ['English', 'History'],
  });

  console.log('Creating classes...');
  const class10 = await ClassRoom.create({
    name: 'Grade 10',
    section: 'A',
    classTeacher: teacher1._id,
    subjects: [
      { name: 'Physics', teacher: teacher1._id },
      { name: 'English', teacher: teacher2._id },
    ],
  });

  const class9 = await ClassRoom.create({
    name: 'Grade 9',
    section: 'B',
    classTeacher: teacher2._id,
    subjects: [{ name: 'Mathematics', teacher: teacher1._id }],
  });

  console.log('Creating students...');
  const student1 = await User.create({
    name: 'Arjun Mehta',
    email: 'student@school.edu',
    password: 'password123',
    role: 'student',
    rollNumber: '10A-01',
    classRoom: class10._id,
    guardianName: 'Sunil Mehta',
    guardianPhone: '+91 99887 76655',
  });

  const student2 = await User.create({
    name: 'Sara Khan',
    email: 'sara@school.edu',
    password: 'password123',
    role: 'student',
    rollNumber: '10A-02',
    classRoom: class10._id,
  });

  const student3 = await User.create({
    name: 'Dev Patel',
    email: 'dev@school.edu',
    password: 'password123',
    role: 'student',
    rollNumber: '9B-01',
    classRoom: class9._id,
  });

  class10.students = [student1._id, student2._id];
  class9.students = [student3._id];
  await class10.save();
  await class9.save();

  console.log('Creating assignments & lectures...');
  await Assignment.create({
    title: "Newton's Laws — Problem Set 3",
    description: 'Solve problems 1–12 from chapter 5. Show all working.',
    subject: 'Physics',
    classRoom: class10._id,
    createdBy: teacher1._id,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    maxMarks: 50,
  });

  await Assignment.create({
    title: 'Essay: A Memorable Journey',
    description: 'Write a 500-word descriptive essay.',
    subject: 'English',
    classRoom: class10._id,
    createdBy: teacher2._id,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    maxMarks: 25,
  });

  await Lecture.create({
    title: 'Understanding Force and Motion',
    description: 'A visual introduction to the three laws of motion.',
    subject: 'Physics',
    classRoom: class10._id,
    createdBy: teacher1._id,
    videoUrl: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds',
    sourceType: 'link',
    durationMinutes: 14,
  });

  await Announcement.create({
    title: 'Welcome to the new term',
    body: 'Classes resume Monday. Please check your timetable on the portal.',
    audience: 'all',
    createdBy: admin._id,
  });

  console.log('Creating attendance, fees & notes...');
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  await Attendance.create({
    classRoom: class10._id,
    date: yesterday,
    subject: 'Physics',
    markedBy: teacher1._id,
    records: [
      { student: student1._id, status: 'present' },
      { student: student2._id, status: 'absent' },
    ],
  });
  await Attendance.create({
    classRoom: class10._id,
    date: today,
    subject: 'Physics',
    markedBy: teacher1._id,
    records: [
      { student: student1._id, status: 'present' },
      { student: student2._id, status: 'present' },
    ],
  });

  await Fee.create([
    {
      student: student1._id, classRoom: class10._id, title: 'Term 1 Tuition',
      amount: 25000, dueDate: new Date(Date.now() + 10 * 86400000),
      status: 'pending', createdBy: admin._id,
    },
    {
      student: student2._id, classRoom: class10._id, title: 'Term 1 Tuition',
      amount: 25000, dueDate: new Date(Date.now() + 10 * 86400000),
      status: 'paid', paidAmount: 25000, paidDate: new Date(), method: 'upi', createdBy: admin._id,
    },
  ]);

  await Note.create({
    title: 'Chapter 5 — Laws of Motion (Summary)',
    description: 'Key formulas and concepts for the upcoming test.',
    subject: 'Physics',
    classRoom: class10._id,
    createdBy: teacher1._id,
    fileUrl: 'https://www.physicsclassroom.com/class/newtlaws',
    fileType: 'link',
    fileName: 'External resource',
  });

  console.log('\n✅ Seed complete. Demo accounts (password: password123):');
  console.log('   Admin   → admin@school.edu');
  console.log('   Teacher → teacher@school.edu');
  console.log('   Student → student@school.edu');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
