import asyncHandler from 'express-async-handler';
import ClassRoom from '../models/ClassRoom.js';
import User from '../models/User.js';

// @route  GET /api/classes
export const getClasses = asyncHandler(async (req, res) => {
  const classes = await ClassRoom.find({
  school: req.user.school,
})
    .populate('classTeacher', 'name email')
    .populate('subjects.teacher', 'name')
    .sort({ name: 1, section: 1 });

  // attach student counts
  const withCounts = classes.map((c) => ({
    ...c.toObject(),
    studentCount: c.students.length,
  }));
  res.json(withCounts);
});

// @route  GET /api/classes/:id
export const getClassById = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findOne({
  _id: req.params.id,
  school: req.user.school,
})
    .populate('classTeacher', 'name email')
    .populate('students', 'name email rollNumber')
    .populate('subjects.teacher', 'name email');
  if (!classRoom) {
    res.status(404);
    throw new Error('Class not found');
  }
  res.json(classRoom);
});

// @route  POST /api/classes
// @access admin
export const createClass = asyncHandler(async (req, res) => {
  const { name, section } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Class name is required');
  }
  const classRoom = await ClassRoom.create({
  name,
  section: section || "A",
  classTeacher: req.body.classTeacher || undefined,
  subjects: req.body.subjects || [],
  school: req.user.school,
});
  res.status(201).json(classRoom);
});

// @route  PUT /api/classes/:id
// @access admin
export const updateClass = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!classRoom) {
    res.status(404);
    throw new Error('Class not found');
  }
  ['name', 'section', 'classTeacher', 'subjects'].forEach((f) => {
    if (req.body[f] !== undefined) classRoom[f] = req.body[f];
  });
  await classRoom.save();
  res.json(classRoom);
});

// @route  DELETE /api/classes/:id
// @access admin
export const deleteClass = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!classRoom) {
    res.status(404);
    throw new Error('Class not found');
  }
  // unlink students
await User.updateMany(
  {
    classRoom: classRoom._id,
    school: req.user.school,
  },
  {
    $unset: {
      classRoom: "",
    },
  }
);


  await classRoom.deleteOne();
  res.json({ message: 'Class removed' });
});
