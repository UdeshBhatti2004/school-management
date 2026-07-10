import asyncHandler from 'express-async-handler';
import ClassRoom from '../models/ClassRoom.js';
import User from '../models/User.js';
import { getIO } from "../socket/index.js";

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

  if (!req.body.classTeacher) {
  res.status(400);
  throw new Error("Class teacher is required.");
}

  const existingClass = await ClassRoom.findOne({
  school: req.user.school,
  name: name.trim(),
  section: (section || "A").trim(),
});

if (existingClass) {
  res.status(400);
  throw new Error(
    `Class ${name.trim()} • ${(section || "A").trim()} already exists.`
  );
}


if (req.body.classTeacher) {
  const teacher = await User.findOne({
    _id: req.body.classTeacher,
    school: req.user.school,
    role: "teacher",
  });

  if (!teacher) {
    res.status(400);
    throw new Error("Selected class teacher is invalid.");
  }

  const existingClassTeacher = await ClassRoom.findOne({
  school: req.user.school,
  classTeacher: req.body.classTeacher,
});

  if (existingClassTeacher) {
    res.status(400);
    throw new Error(
      `This teacher is already assigned as the class teacher of ${existingClassTeacher.name} • ${existingClassTeacher.section}.`
    );
  }
}

if (req.body.subjects?.length) {
  const seenSubjects = new Set();

  for (const subject of req.body.subjects) {
    const subjectName = subject.name?.trim();

    if (!subjectName) {
      res.status(400);
      throw new Error("Subject name is required.");
    }

    const normalized = subjectName.toLowerCase();

    if (seenSubjects.has(normalized)) {
      res.status(400);
      throw new Error(`Duplicate subject "${subjectName}" found.`);
    }

    seenSubjects.add(normalized);

    if (subject.teacher) {
      const teacher = await User.findOne({
        _id: subject.teacher,
        school: req.user.school,
        role: "teacher",
      });

      if (!teacher) {
        res.status(400);
        throw new Error(
          `Invalid teacher selected for subject "${subjectName}".`
        );
      }
    }
  }
}


  const classRoom = await ClassRoom.create({
  name: name.trim(),
section: (section || "A").trim(),
  classTeacher: req.body.classTeacher || undefined,
  subjects: req.body.subjects || [],
  school: req.user.school,
});


getIO().to(`school:${req.user.school}`).emit("class:created");


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

  if (
  req.body.classTeacher !== undefined &&
  !req.body.classTeacher
) {
  res.status(400);
  throw new Error("Class teacher is required.");
}

const duplicateClass = await ClassRoom.findOne({
  school: req.user.school,
  name: (req.body.name ?? classRoom.name).trim(),
  section: (req.body.section ?? classRoom.section).trim(),
  _id: { $ne: classRoom._id },
});

if (req.body.classTeacher) {
  const teacher = await User.findOne({
    _id: req.body.classTeacher,
    school: req.user.school,
    role: "teacher",
  });

  if (!teacher) {
    res.status(400);
    throw new Error("Selected class teacher is invalid.");
  }

  const existingClassTeacher = await ClassRoom.findOne({
    school: req.user.school,
    classTeacher: req.body.classTeacher,
    _id: { $ne: classRoom._id },
  });

  if (existingClassTeacher) {
    res.status(400);
    throw new Error(
      `This teacher is already assigned as the class teacher of ${existingClassTeacher.name} • ${existingClassTeacher.section}.`
    );
  }
}

if (duplicateClass) {
  res.status(400);
  throw new Error(
    `Class ${(req.body.name ?? classRoom.name).trim()} • ${(req.body.section ?? classRoom.section).trim()} already exists.`
  );
}

if (req.body.subjects?.length) {
  const seenSubjects = new Set();

  for (const subject of req.body.subjects) {
    const subjectName = subject.name?.trim();

    if (!subjectName) {
      res.status(400);
      throw new Error("Subject name is required.");
    }

    const normalized = subjectName.toLowerCase();

    if (seenSubjects.has(normalized)) {
      res.status(400);
      throw new Error(`Duplicate subject "${subjectName}" found.`);
    }

    seenSubjects.add(normalized);

    if (subject.teacher) {
      const teacher = await User.findOne({
        _id: subject.teacher,
        school: req.user.school,
        role: "teacher",
      });

      if (!teacher) {
        res.status(400);
        throw new Error(
          `Invalid teacher selected for subject "${subjectName}".`
        );
      }
    }
  }
}

  ['name', 'section', 'classTeacher', 'subjects'].forEach((f) => {
    if (req.body[f] !== undefined) classRoom[f] = req.body[f];
  });
  await classRoom.save();
  getIO().to(`school:${req.user.school}`).emit("class:updated");
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
const assignedStudents = await User.countDocuments({
  classRoom: classRoom._id,
  school: req.user.school,
});

if (assignedStudents > 0) {
  res.status(400);
  throw new Error(
    "Cannot delete this class because students are still assigned to it. Please move or remove all students first."
  );
}

await classRoom.deleteOne();

getIO().to(`school:${req.user.school}`).emit("class:deleted");

  res.json({ message: 'Class removed' });
});
