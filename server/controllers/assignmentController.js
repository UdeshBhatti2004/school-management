import asyncHandler from 'express-async-handler';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { getIO } from "../socket/index.js";

// @route  GET /api/assignments
// Scoped by role: students see their class; teachers see what they created; admin sees all
export const getAssignments = asyncHandler(async (req, res) => {
  const filter = {
  school: req.user.school,
};
  if (req.user.role === 'student') {
    if (!req.user.classRoom) return res.json([]);
    filter.classRoom = req.user.classRoom;
  } else if (req.user.role === 'teacher') {
    filter.createdBy = req.user._id;
  }
  if (req.query.classRoom) filter.classRoom = req.query.classRoom;

  const assignments = await Assignment.find(filter)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name')
    .sort({ dueDate: 1 });

  // For students, attach their own submission status
  if (req.user.role === 'student') {
    const subs = await Submission.find({
  student: req.user._id,
  assignment: { $in: assignments.map((a) => a._id) },
  school: req.user.school,
});
    const map = Object.fromEntries(subs.map((s) => [s.assignment.toString(), s]));
    return res.json(
      assignments.map((a) => ({ ...a.toObject(), mySubmission: map[a._id.toString()] || null }))
    );
  }

  res.json(assignments);
});

// @route  GET /api/assignments/:id
export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({
  _id: req.params.id,
  school: req.user.school,
})
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name');
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  res.json(assignment);
});

// @route  POST /api/assignments
// @access teacher, admin
export const createAssignment = asyncHandler(async (req, res) => {
  const { title, classRoom, dueDate } = req.body;
  if (!title || !classRoom || !dueDate) {
    res.status(400);
    throw new Error('Title, class and due date are required');
  }
  const assignment = await Assignment.create({
  ...req.body,
  createdBy: req.user._id,
  school: req.user.school,
});
  const populated = await Assignment.findById(assignment._id)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name');
    
    getIO()
  .to(`class:${assignment.classRoom}`)
  .emit("assignment:created");
  res.status(201).json(populated);

});

// @route  PUT /api/assignments/:id
// @access teacher (owner), admin
export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (req.user.role === 'teacher' && assignment.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own assignments');
  }
  ['title', 'description', 'subject', 'classRoom', 'dueDate', 'maxMarks', 'attachmentUrl'].forEach(
    (f) => {
      if (req.body[f] !== undefined) assignment[f] = req.body[f];
    }
  );
  await assignment.save();
  res.json(assignment);
});

// @route  DELETE /api/assignments/:id
// @access teacher (owner), admin
export const deleteAssignment = asyncHandler(async (req, res) => {
const assignment = await Assignment.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (req.user.role === 'teacher' && assignment.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own assignments');
  }
await Submission.deleteMany({
  assignment: assignment._id,
  school: req.user.school,
});
  await assignment.deleteOne();
  res.json({ message: 'Assignment removed' });
});
