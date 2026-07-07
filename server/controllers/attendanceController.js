import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import ClassRoom from '../models/ClassRoom.js';
import mongoose from 'mongoose';
import { getIO } from "../socket/index.js"; // adjust the path if needed


// @route  POST /api/attendance   (teacher, admin)
// Upsert one attendance sheet per class/date/subject
export const markAttendance = asyncHandler(async (req, res) => {

    console.log("markAttendance called");

   
  const { classRoom, date, records } = req.body;

  if (!classRoom || !date || !Array.isArray(records)) {
    res.status(400);
    throw new Error('Class, date and records are required');
  }

  if (!mongoose.Types.ObjectId.isValid(classRoom)) {
  res.status(400);
  throw new Error('Invalid class ID');
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  res.status(400);
  throw new Error('Invalid date format');
}

if (records.length === 0) {
  res.status(400);
  throw new Error('Attendance records are required');
}

const classData = await ClassRoom.findOne({
  _id: classRoom,
  school: req.user.school,
}).select("students classTeacher");


if (!classData) {
  res.status(404);
  throw new Error("Class not found");
}

if (!classData.classTeacher) {
  res.status(400);
  throw new Error(
    "Please assign a class teacher before marking attendance."
  );
}

if (req.user.role !== "teacher") {
  res.status(403);
  throw new Error("Only class teachers can mark attendance.");
}

if (classData.classTeacher.toString() !== req.user._id.toString()) {
  res.status(403);
  throw new Error("You are not the class teacher for this class.");
}




const validStatuses = ["present", "absent", "late"];

const classStudentIds = new Set(
  classData.students.map((id) => id.toString())
);

const seenStudents = new Set();

for (const record of records) {
  if (!mongoose.Types.ObjectId.isValid(record.student)) {
    res.status(400);
    throw new Error("Invalid student ID");
  }

  if (!validStatuses.includes(record.status)) {
    res.status(400);
    throw new Error("Invalid attendance status");
  }

  if (!classStudentIds.has(record.student.toString())) {
    res.status(400);
    throw new Error(
      "Attendance can only be marked for students in the selected class"
    );
  }

  if (seenStudents.has(record.student.toString())) {
    res.status(400);
    throw new Error(
      "Duplicate student found in attendance records"
    );
  }

  seenStudents.add(record.student.toString());
}

 const existingSheet = await Attendance.findOne({
  classRoom,
  date,
  school: req.user.school,
});

const updateData = {
  classRoom,
  date,
  records,
  school: req.user.school,
};

if (!existingSheet) {
  // First time attendance is marked
  updateData.markedBy = req.user._id;
} else {
  // Attendance is being edited
  updateData.lastEditedBy = req.user._id;
  updateData.lastEditedAt = new Date();
}

const sheet = await Attendance.findOneAndUpdate(
  {
    classRoom,
    date,
    school: req.user.school,
  },
  updateData,
  {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }
)
  .populate("markedBy", "name")
  .populate("lastEditedBy", "name")
  .populate("records.student", "name rollNumber");


getIO().emit("attendance:marked", sheet);



  res.status(201).json(sheet);
});

// @route  GET /api/attendance?classRoom=&date=   (teacher, admin)
  export const getAttendance = asyncHandler(async (req, res) => {
    const filter = {
    school: req.user.school,
  };
    if (req.query.classRoom) {
    if (!mongoose.Types.ObjectId.isValid(req.query.classRoom)) {
      res.status(400);
      throw new Error("Invalid class ID");
    }

    filter.classRoom = req.query.classRoom;
  }
  if (req.query.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query.date)) {
      res.status(400);
      throw new Error("Invalid date format");
    }

    filter.date = req.query.date;
  }

    const sheets = await Attendance.find(filter)
  .populate('classRoom', 'name section')
  .populate('markedBy', 'name')
  .populate('records.student', 'name rollNumber')
  .sort({ date: -1 });

res.json(sheets);
  });

// @route  GET /api/attendance/me   (student)
// Returns the student's attendance history + summary
export const getMyAttendance = asyncHandler(async (req, res) => {
  if (!req.user.classRoom) return res.json({ summary: { present: 0, absent: 0, late: 0, total: 0, percent: 0 }, history: [] });

  const sheets = await Attendance.find({
  classRoom: req.user.classRoom,
  school: req.user.school,
})
    .populate('markedBy', 'name')
    .sort({ date: -1 });

  const history = [];
  const summary = { present: 0, absent: 0, late: 0, total: 0, percent: 0 };

  for (const sheet of sheets) {
    const rec = sheet.records.find((r) => r.student.toString() === req.user._id.toString());
    if (!rec) continue;
    summary.total += 1;
    summary[rec.status] += 1;
    history.push({
  date: sheet.date,
  status: rec.status,
  markedBy: sheet.markedBy?.name,
});
  }
  summary.percent = summary.total
    ? Math.round(((summary.present + summary.late) / summary.total) * 100)
    : 0;

  res.json({ summary, history });
});

// @route  GET /api/attendance/summary?classRoom=   (admin)
// Per-student attendance percentage for a class
export const getClassSummary = asyncHandler(async (req, res) => {
  const { classRoom } = req.query;
  if (!classRoom) {
    res.status(400);
    throw new Error('classRoom is required');
  }

if (!mongoose.Types.ObjectId.isValid(classRoom)) {
  res.status(400);
  throw new Error("Invalid class ID");
}


  const cls = await ClassRoom.findOne({
  _id: classRoom,
  school: req.user.school,
}).populate('students', 'name rollNumber');
  if (!cls) {
    res.status(404);
    throw new Error('Class not found');
  }
  const sheets = await Attendance.find({
  classRoom,
  school: req.user.school,
});

  const summary = cls.students.map((s) => {
    let present = 0, total = 0;
    for (const sheet of sheets) {
      const rec = sheet.records.find((r) => r.student.toString() === s._id.toString());
      if (rec) {
        total += 1;
        if (rec.status !== 'absent') present += 1;
      }
    }
    return {
      student: { _id: s._id, name: s.name, rollNumber: s.rollNumber },
      present,
      total,
      percent: total ? Math.round((present / total) * 100) : 0,
    };
  });

  res.json({ class: { name: cls.name, section: cls.section }, summary });
});
