import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom' },
     /// organize data based on your schools
        school: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "School",
          required: true,
        },
    title: { type: String, required: true }, // e.g. "Term 1 Tuition"
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
    paidAmount: { type: Number, default: 0 },
    paidDate: { type: Date },
    method: { type: String, default: '' }, // cash, upi, card, bank
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
