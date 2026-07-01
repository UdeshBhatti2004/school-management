import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';

// @route  POST /api/assignments/:id/submit
// @access student
export const submitAssignment = asyncHandler(async (req, res) => {
const assignment = await Assignment.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const isLate = new Date() > new Date(assignment.dueDate);
  const payload = {
    content: req.body.content || '',
    link: req.body.link || '',
    fileUrl: req.body.fileUrl || '',
    status: isLate ? 'late' : 'submitted',
  };

  // Upsert: a student may resubmit until graded
  const existing = await Submission.findOne({
  assignment: assignment._id,
  student: req.user._id,
  school: req.user.school,
});

  if (existing) {
    if (existing.status === 'graded') {
      res.status(400);
      throw new Error('This assignment has already been graded and cannot be resubmitted');
    }
    Object.assign(existing, payload);
    await existing.save();
    return res.json(existing);
  }

  const submission = await Submission.create({
  assignment: assignment._id,
  student: req.user._id,
  school: req.user.school,
  ...payload,
});
  res.status(201).json(submission);
});

// @route  GET /api/assignments/:id/submissions
// @access teacher (owner), admin
export const getSubmissions = asyncHandler(async (req, res) => {
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
    throw new Error('You can only view submissions for your own assignments');
  }
const submissions = await Submission.find({
  assignment: assignment._id,
  school: req.user.school,
}).populate('student', 'name email rollNumber')
    .sort({ createdAt: -1 });
  res.json(submissions);
});

// @route  PUT /api/submissions/:id/grade
// @access teacher, admin
export const gradeSubmission = asyncHandler(async (req, res) => {
const submission = await Submission.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  submission.marks = req.body.marks ?? submission.marks;
  submission.feedback = req.body.feedback ?? submission.feedback;
  submission.status = 'graded';
  await submission.save();
  res.json(submission);
});
