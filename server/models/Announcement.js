import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
     /// organize data based on your schools
        school: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "School",
          required: true,
        },
    audience: {
      type: String,
      enum: ['all', 'teachers', 'students', 'class'],
      default: 'all',
    },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom' },
    attachmentUrl: {
  type: String,
  default: "",
},

attachmentName: {
  type: String,
  default: "",
},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

announcementSchema.index({ school: 1, createdAt: -1 });


const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
