import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 3000,
    },

    // Organize data based on school (multi-tenant)
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    classRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassRoom',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },

    fileName: {
      type: String,
      trim: true,
      default: '',
    },

    fileType: {
      type: String,
      trim: true,
      default: '',
    },

    publicId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Improve query performance
noteSchema.index({
  school: 1,
  classRoom: 1,
  createdAt: -1,
});

const Note = mongoose.model('Note', noteSchema);

export default Note;