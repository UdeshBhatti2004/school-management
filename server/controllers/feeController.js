import asyncHandler from 'express-async-handler';
import Fee from '../models/Fee.js';
import ClassRoom from '../models/ClassRoom.js';
import { getIO } from "../socket/index.js";

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
    .populate("student", "name rollNumber email")
.populate("payments.receivedBy", "name")
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

const trimmedTitle = title?.trim();

if (!trimmedTitle || !amount || !dueDate) {
  res.status(400);
  throw new Error("Title, amount and due date are required.");
}

if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
  res.status(400);
  throw new Error("Title must be between 3 and 100 characters.");
}

const feeAmount = Number(amount);

if (isNaN(feeAmount) || feeAmount <= 0) {
  res.status(400);
  throw new Error("Amount must be greater than 0.");
}

const parsedDueDate = new Date(dueDate);

if (isNaN(parsedDueDate.getTime())) {
  res.status(400);
  throw new Error("Invalid due date.");
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
  title: trimmedTitle,
  amount: feeAmount,
  dueDate,
  notes,
  createdBy: req.user._id,
  school: req.user.school,
}));
    const created = await Fee.insertMany(docs);

getIO().to(`school:${req.user.school}`).emit("fee:created", created);

return res.status(201).json({
  message: `Issued to ${created.length} students`,
  count: created.length,
});

  }

  if (!student) {
    res.status(400);
    throw new Error('Provide a student or a class to issue the fee to');
  }
const fee = await Fee.create({
  student,
  title: trimmedTitle,
  amount: feeAmount,
  dueDate,
  notes,
  createdBy: req.user._id,
  school: req.user.school,
}); 

const populated = await Fee.findById(fee._id).populate(
  "student",
  "name rollNumber"
);

getIO().to(`school:${req.user.school}`).emit("fee:created", populated);

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
  const {
  paidAmount,
  method,
  remarks = "",
} = req.body;

const amount = Number(paidAmount);

const trimmedRemarks = remarks.trim();

if (trimmedRemarks.length > 500) {
  res.status(400);
  throw new Error("Remarks cannot exceed 500 characters.");
}

const allowedMethods = [
  "cash",
  "upi",
  "bank",
  "cheque",
  "card",
];

if (!allowedMethods.includes(method)) {
  res.status(400);
  throw new Error("Invalid payment method.");
}
 
 if (isNaN(amount) || amount <= 0) {
  res.status(400);
  throw new Error("Payment amount must be greater than 0.");
}

const outstanding = fee.amount - fee.paidAmount;

if (amount > outstanding) {
  res.status(400);
  throw new Error(
    `Payment exceeds outstanding balance. Remaining balance is ₹${outstanding}.`
  );
}

if (fee.status === "paid") {
  res.status(400);
  throw new Error("This fee has already been paid.");
}

fee.payments.push({
  amount,
  method,
  remarks: trimmedRemarks,
  receivedBy: req.user._id,
});

fee.paidAmount += amount;

if (fee.paidAmount >= fee.amount) {
  fee.status = "paid";
} else {
  fee.status = "partial";
}

 await fee.save();

getIO().to(`school:${req.user.school}`).emit("fee:paymentRecorded", fee);

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
    throw new Error("Fee record not found");
  }

  if (fee.status === "paid") {
    res.status(400);
    throw new Error("Paid fees cannot be edited.");
  }

  if (req.body.title !== undefined) {
  const trimmedTitle = req.body.title.trim();

  if (!trimmedTitle) {
    res.status(400);
    throw new Error("Title is required.");
  }

  if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
    res.status(400);
    throw new Error("Title must be between 3 and 100 characters.");
  }

  fee.title = trimmedTitle;
}

if (req.body.amount !== undefined) {
  const amount = Number(req.body.amount);

  if (isNaN(amount) || amount <= 0) {
    res.status(400);
    throw new Error("Amount must be greater than 0.");
  }

  fee.amount = amount;
}

if (req.body.dueDate !== undefined) {
  const parsedDueDate = new Date(req.body.dueDate);

  if (isNaN(parsedDueDate.getTime())) {
    res.status(400);
    throw new Error("Invalid due date.");
  }

  fee.dueDate = req.body.dueDate;
}

if (req.body.notes !== undefined) {
  const trimmedNotes = req.body.notes.trim();

  if (trimmedNotes.length > 500) {
    res.status(400);
    throw new Error("Notes cannot exceed 500 characters.");
  }

  fee.notes = trimmedNotes;
}

  // ✅ Add it here
  if (fee.amount < fee.paidAmount) {
    res.status(400);
    throw new Error(
      "Fee amount cannot be less than the amount already paid."
    );
  }

  await fee.save();

getIO().to(`school:${req.user.school}`).emit("fee:updated", fee);

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

  if (fee.paidAmount > 0) {
  res.status(400);
  throw new Error(
    "Fees with recorded payments cannot be deleted."
  );
}

  await fee.deleteOne();

getIO().to(`school:${req.user.school}`).emit("fee:deleted", fee);

res.json({ message: "Fee record removed" });
});
