import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' }, // text answer
    link: { type: String, default: '' }, // external link
    fileUrl: { type: String, default: '' }, // uploaded file path
    fileName: {
      type: String,
      default: "",
    },
    /// organize data based on your schools
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded'],
      default: 'submitted',
    },
    marks: { type: Number, default: null },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

// One submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
