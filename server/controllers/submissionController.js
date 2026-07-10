import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import { getIO } from "../socket/index.js";


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

  if (
    !req.user.classRoom ||
    assignment.classRoom.toString() !== req.user.classRoom.toString()
  ) {
    res.status(403);
    throw new Error('You can only submit assignments for your own class');
  }

const content = req.body.content?.trim() || "";
const link = req.body.link?.trim() || "";
const fileUrl = req.body.fileUrl?.trim() || "";

if (!content) {
  res.status(400);
  throw new Error("Submission description is required.");
}

if (!/[A-Za-z]/.test(content)) {
  res.status(400);
  throw new Error(
    "Submission description must contain at least one letter."
  );
}

if (!link && !fileUrl) {
  res.status(400);
  throw new Error("Please upload a file or provide a submission link.");
}

if (link) {
  try {
    new URL(link);
  } catch {
    res.status(400);
    throw new Error("Please enter a valid submission link.");
  }
}


  const isLate = new Date() > new Date(assignment.dueDate);
 const payload = {
  content,
  link,
  fileUrl,
  fileName: req.body.fileName || "",
  status: isLate ? "late" : "submitted",
};;

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

getIO()
  .to(`user:${assignment.createdBy}`)
  .emit("submission:created", {
    assignmentId: assignment._id,
  });

return res.json(existing);
  }

  const submission = await Submission.create({
  assignment: assignment._id,
  student: req.user._id,
  school: req.user.school,
  ...payload,
});

getIO()
  .to(`user:${assignment.createdBy}`)
  .emit("submission:created", {
    assignmentId: assignment._id,
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

 const assignment = await Assignment.findById(submission.assignment);

if (!assignment) {
  res.status(404);
  throw new Error("Assignment not found");
}

if (
  req.user.role === "teacher" &&
  assignment.createdBy.toString() !== req.user._id.toString()
) {
  res.status(403);
  throw new Error("You can only grade submissions for your own assignments");
}

  const marks = Number(req.body.marks);
const feedback = req.body.feedback?.trim() || "";

if (req.body.marks === undefined || req.body.marks === "") {
  res.status(400);
  throw new Error("Marks are required.");
}

if (Number.isNaN(marks)) {
  res.status(400);
  throw new Error("Please enter valid marks.");
}

if (marks < 0) {
  res.status(400);
  throw new Error("Marks cannot be negative.");
}

if (marks > assignment.maxMarks) {
  res.status(400);
  throw new Error(`Marks cannot exceed ${assignment.maxMarks}.`);
}

if (!feedback) {
  res.status(400);
  throw new Error("Feedback is required.");
}

submission.marks = marks;
submission.feedback = feedback;
submission.status = "graded";
  await submission.save();

  getIO()
  .to(`user:${submission.student.toString()}`)
  .emit("submission:graded", {
    assignmentId: submission.assignment.toString(),
    submissionId: submission._id.toString(),
  });


  res.json(submission);
});
