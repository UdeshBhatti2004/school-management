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

  const assignmentsWithSubmissionInfo = await Promise.all(
  assignments.map(async (assignment) => {
    const submissionCount = await Submission.countDocuments({
      assignment: assignment._id,
      school: req.user.school,
    });

    return {
      ...assignment.toObject(),
      hasSubmissions: submissionCount > 0,
    };
  })
);

res.json(assignmentsWithSubmissionInfo);
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
  const { title, classRoom, dueDate ,subject } = req.body;
  if (!title || !classRoom || !dueDate  || !subject) {
    res.status(400);
    throw new Error('Title, class, due date and subject are required');
  }


  if (!/[A-Za-z]/.test(title)) {
  res.status(400);
  throw new Error("Title must contain at least one letter.");
}

if (req.body.description && !/[A-Za-z]/.test(req.body.description)) {
  res.status(400);
  throw new Error("Instructions must contain at least one letter.");

}

if (req.body.subject && !/^[A-Za-z\s]+$/.test(req.body.subject.trim())) {
  res.status(400);
  throw new Error("Subject can only contain letters and spaces.");
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const assignmentDueDate = new Date(dueDate);
assignmentDueDate.setHours(0, 0, 0, 0);

if (assignmentDueDate < today) {
  res.status(400);
  throw new Error("Due date cannot be in the past.");
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

  if (
  req.user.role === "teacher" &&
  assignment.createdBy.toString() !== req.user._id.toString()
) {
  res.status(403);
  throw new Error("You can only edit your own assignments");
}

const submissionCount = await Submission.countDocuments({
  assignment: assignment._id,
  school: req.user.school,
});

if (submissionCount > 0) {


   if (
  req.body.subject &&
  req.body.subject !== assignment.subject
) {
  res.status(400);
  throw new Error(
    "Subject cannot be changed after students have submitted the assignment."
  );
}

  if (
    req.body.classRoom &&
    req.body.classRoom !== assignment.classRoom.toString()
  ) {
    res.status(400);
    throw new Error(
      "Class cannot be changed after students have submitted the assignment."
    );
  }

  if (
    req.body.maxMarks !== undefined &&
    Number(req.body.maxMarks) !== assignment.maxMarks
  ) {
    res.status(400);
    throw new Error(
      "Maximum marks cannot be changed after students have submitted the assignment."
    );
  }
}

if (
  req.body.subject &&
  !/^[A-Za-z\s]+$/.test(req.body.subject.trim())
) {
  res.status(400);
  throw new Error("Subject can only contain letters and spaces.");
}


if (req.body.dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newDueDate = new Date(req.body.dueDate);
  newDueDate.setHours(0, 0, 0, 0);

  if (newDueDate < today) {
    res.status(400);
    throw new Error("Due date cannot be in the past.");
  }
}

  ['title', 'description', 'subject', 'classRoom', 'dueDate', 'maxMarks', 'attachmentUrl'].forEach(
    (f) => {
      if (req.body[f] !== undefined) assignment[f] = req.body[f];
    }
  );
  await assignment.save();

 getIO()
  .to(`class:${assignment.classRoom.toString()}`)
  .emit("assignment:updated", {
    assignmentId: assignment._id.toString(),
  });


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

const classRoomId = assignment.classRoom.toString();


  await assignment.deleteOne();

getIO()
  .to(`class:${classRoomId}`)
  .emit("assignment:deleted", {
    assignmentId: assignment._id.toString(),
  });

  res.json({ message: 'Assignment removed' });
});
