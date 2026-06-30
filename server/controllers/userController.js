import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import ClassRoom from '../models/ClassRoom.js';
import Assignment from '../models/Assignment.js';
import Lecture from '../models/Lecture.js';
import Fee from '../models/Fee.js';
import Note from '../models/Note.js';

// @route  GET /api/users?role=teacher|student
// @access admin
export const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter)
    .populate('classRoom', 'name section')
    .sort({ createdAt: -1 });
  res.json(users);
});

// @route  GET /api/users/:id
// @access admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('classRoom', 'name section');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

// @route  POST /api/users
// @access admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password and role are required');
  }
  if (!['teacher', 'student', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('A user with that email already exists');
  }

  const user = await User.create(req.body);

  // If a student is assigned to a class, keep the classroom roster in sync
  if (user.role === 'student' && user.classRoom) {
    await ClassRoom.findByIdAndUpdate(user.classRoom, { $addToSet: { students: user._id } });
  }

  const created = await User.findById(user._id).populate('classRoom', 'name section');
  res.status(201).json(created);
});

// @route  PUT /api/users/:id
// @access admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const prevClass = user.classRoom?.toString();
  const fields = [
    'name', 'email', 'phone', 'avatar', 'isActive', 'employeeId',
    'department', 'subjects', 'rollNumber', 'classRoom', 'guardianName', 'guardianPhone',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });
  if (req.body.password) user.password = req.body.password;
  await user.save();

  // Sync classroom roster if a student's class changed
  if (user.role === 'student') {
    const newClass = user.classRoom?.toString();
    if (prevClass && prevClass !== newClass) {
      await ClassRoom.findByIdAndUpdate(prevClass, { $pull: { students: user._id } });
    }
    if (newClass && newClass !== prevClass) {
      await ClassRoom.findByIdAndUpdate(newClass, { $addToSet: { students: user._id } });
    }
  }

  const updated = await User.findById(user._id).populate('classRoom', 'name section');
  res.json(updated);
});

// @route  DELETE /api/users/:id
// @access admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.classRoom) {
    await ClassRoom.findByIdAndUpdate(user.classRoom, { $pull: { students: user._id } });
  }
  await user.deleteOne();
  res.json({ message: 'User removed' });
});

// @route  GET /api/users/stats/overview
// @access admin
export const getStats = asyncHandler(async (req, res) => {
  const [teachers, students, classes, assignments, lectures, notes, fees] = await Promise.all([
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'student' }),
    ClassRoom.countDocuments(),
    Assignment.countDocuments(),
    Lecture.countDocuments(),
    Note.countDocuments(),
    Fee.find().select('amount paidAmount'),
  ]);
  const outstanding = fees.reduce((s, f) => s + (f.amount - f.paidAmount), 0);
  res.json({ teachers, students, classes, assignments, lectures, notes, outstanding });
});
