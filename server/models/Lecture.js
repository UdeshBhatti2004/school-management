import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
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
    videoUrl: { type: String, required: true }, // YouTube/Vimeo/any link, or Cloudinary URL
    sourceType: { type: String, enum: ['link', 'upload'], default: 'link' },
    publicId: { type: String, default: '' }, // Cloudinary public id (for deletion)
    thumbnail: { type: String, default: '' },
    durationMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Lecture = mongoose.model('Lecture', lectureSchema);
export default Lecture;
