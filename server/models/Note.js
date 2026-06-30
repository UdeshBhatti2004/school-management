import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, default: '' },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, default: '' }, // Cloudinary URL or external link
    fileName: { type: String, default: '' },
    fileType: { type: String, default: '' }, // pdf, doc, image, link
    publicId: { type: String, default: '' }, // Cloudinary public id (for deletion)
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);
export default Note;
