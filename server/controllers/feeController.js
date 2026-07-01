import asyncHandler from 'express-async-handler';
import Fee from '../models/Fee.js';
import ClassRoom from '../models/ClassRoom.js';

// @route  GET /api/fees   (admin: all/filtered; student: own)
export const getFees = asyncHandler(async (req, res) => {
  const filter = {
  school: req.user.school,
};
  if (req.user.role === 'student') {
    filter.student = req.user._id;
  } else {
    if (req.query.student) filter.student = req.query.student;
    if (req.query.classRoom) filter.classRoom = req.query.classRoom;
    if (req.query.status) filter.status = req.query.status;
  }

  const fees = await Fee.find(filter)
    .populate('student', 'name rollNumber email')
    .populate('classRoom', 'name section')
    .sort({ dueDate: -1 });
  res.json(fees);
});

// @route  GET /api/fees/summary   (admin)
export const getFeeSummary = asyncHandler(async (req, res) => {
  const fees = await Fee.find({
  school: req.user.school,
});
  const totalBilled = fees.reduce((s, f) => s + f.amount, 0);
  const totalCollected = fees.reduce((s, f) => s + f.paidAmount, 0);
  const pending = fees.filter((f) => f.status !== 'paid').length;
  res.json({
    totalBilled,
    totalCollected,
    outstanding: totalBilled - totalCollected,
    records: fees.length,
    pending,
  });
});

// @route  POST /api/fees   (admin)
// Create a fee for one student, or for an entire class (issueToClass=classId)
export const createFee = asyncHandler(async (req, res) => {
  const { title, amount, dueDate, issueToClass, student, notes } = req.body;
  if (!title || !amount || !dueDate) {
    res.status(400);
    throw new Error('Title, amount and due date are required');
  }

  if (issueToClass) {
    const cls = await ClassRoom.findOne({
  _id: issueToClass,
  school: req.user.school,
})
    if (!cls) {
      res.status(404);
      throw new Error('Class not found');
    }
    const docs = cls.students.map((s) => ({
  student: s._id,
  classRoom: cls._id,
  title,
  amount,
  dueDate,
  notes,
  createdBy: req.user._id,
  school: req.user.school,
}));
    const created = await Fee.insertMany(docs);
    return res.status(201).json({ message: `Issued to ${created.length} students`, count: created.length });
  }

  if (!student) {
    res.status(400);
    throw new Error('Provide a student or a class to issue the fee to');
  }
const fee = await Fee.create({
  student,
  title,
  amount,
  dueDate,
  notes,
  createdBy: req.user._id,
  school: req.user.school,
});  const populated = await Fee.findById(fee._id).populate('student', 'name rollNumber');
  res.status(201).json(populated);
});

// @route  PUT /api/fees/:id/pay   (admin) — record a payment
export const recordPayment = asyncHandler(async (req, res) => {
const fee = await Fee.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  const { paidAmount, method } = req.body;
  const amount = Number(paidAmount ?? fee.amount);
  fee.paidAmount = amount;
  fee.method = method || fee.method;
  fee.paidDate = new Date();
  fee.status = amount >= fee.amount ? 'paid' : amount > 0 ? 'partial' : 'pending';
  await fee.save();
  res.json(fee);
});

// @route  PUT /api/fees/:id   (admin) — edit
export const updateFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  ['title', 'amount', 'dueDate', 'notes', 'status'].forEach((f) => {
    if (req.body[f] !== undefined) fee[f] = req.body[f];
  });
  await fee.save();
  res.json(fee);
});

// @route  DELETE /api/fees/:id   (admin)
export const deleteFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  await fee.deleteOne();
  res.json({ message: 'Fee record removed' });
});
