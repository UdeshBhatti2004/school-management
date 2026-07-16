import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
     /// organize data based on your schools
        school: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "School",
          required: true,
        },
    subject: { type: String, default: '' },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
    attachmentUrl: { type: String, default: '' }, // link or uploaded file path
  },
  { timestamps: true }
);

assignmentSchema.index({ school: 1, classRoom: 1 });
assignmentSchema.index({ school: 1, createdBy: 1 });


const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
