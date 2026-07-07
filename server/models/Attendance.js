import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true },
     /// organize data based on your schools
        school: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "School",
          required: true,
        },
    date: { type: String, required: true }, // YYYY-MM-DD for easy unique-per-day
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, default: '' },
    lastEditedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
lastEditedAt: {
  type: Date,
},
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
      },
    ],
  },
  
  { timestamps: true },
  
);

// One attendance sheet per class per date 
attendanceSchema.index(
  {
    school: 1,
    classRoom: 1,
    date: 1,
  },
  { unique: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
