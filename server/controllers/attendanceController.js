import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import ClassRoom from '../models/ClassRoom.js';

// @route  POST /api/attendance   (teacher, admin)
// Upsert one attendance sheet per class/date/subject
export const markAttendance = asyncHandler(async (req, res) => {
  const { classRoom, date, subject = '', records } = req.body;
  if (!classRoom || !date || !Array.isArray(records)) {
    res.status(400);
    throw new Error('Class, date and records are required');
  }

  const sheet = await Attendance.findOneAndUpdate(
    { classRoom, date, subject },
    { classRoom, date, subject, records, markedBy: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('records.student', 'name rollNumber');

  res.status(201).json(sheet);
});

// @route  GET /api/attendance?classRoom=&date=   (teacher, admin)
export const getAttendance = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.classRoom) filter.classRoom = req.query.classRoom;
  if (req.query.date) filter.date = req.query.date;

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

  const sheets = await Attendance.find({ classRoom: req.user.classRoom })
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
      subject: sheet.subject,
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
  const cls = await ClassRoom.findById(classRoom).populate('students', 'name rollNumber');
  if (!cls) {
    res.status(404);
    throw new Error('Class not found');
  }
  const sheets = await Attendance.find({ classRoom });

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
