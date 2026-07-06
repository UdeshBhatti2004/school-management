import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    /// organize data based on your schools
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    }, // YouTube/Vimeo/any link, or Cloudinary URL
    sourceType: { type: String, enum: ['link', 'upload'], default: 'link', trim: true },
    publicId: {
      type: String,
      trim: true,
      default: '',
    }, // Cloudinary public id (for deletion)
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    durationMinutes: {
      type: Number,
      min: 0,
      max: 600,
      default: 0,
    },
  },
  { timestamps: true }
);

lectureSchema.index({
  school: 1,
  classRoom: 1,
});

lectureSchema.index({
  school: 1,
  createdBy: 1,
});

lectureSchema.index({
  school: 1,
  createdAt: -1,
}); 

const Lecture = mongoose.model('Lecture', lectureSchema);
export default Lecture;
