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
    title: {
  type: String,
  required: true,
  trim: true,
  minlength: 3,
  maxlength: 100,
}, // e.g. "Term 1 Tuition"
    amount: {
  type: Number,
  required: true,
  min: 1,
},
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
    paidAmount: { type: Number, default: 0 },
    payments: [
  {
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    method: {
      type: String,
      enum: ["cash", "upi", "bank", "cheque", "card"],
      required: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
], // cash, upi, card, bank
    notes: {
  type: String,
  default: "",
  trim: true,
  maxlength: 500,
},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

feeSchema.index({ school: 1, student: 1 });
feeSchema.index({ school: 1, classRoom: 1 });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
