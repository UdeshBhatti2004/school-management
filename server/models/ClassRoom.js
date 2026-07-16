import mongoose from 'mongoose';

const classRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Grade 10"
    section: { type: String, default: 'A' },
     /// organize data based on your schools
        school: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "School",
          required: true,
        },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subjects: [
      {
        name: { type: String, required: true },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

classRoomSchema.index({ school: 1 });


classRoomSchema.virtual('label').get(function () {
  return `${this.name} - ${this.section}`;
});

classRoomSchema.set('toJSON', { virtuals: true });
classRoomSchema.set('toObject', { virtuals: true });

const ClassRoom = mongoose.model('ClassRoom', classRoomSchema);
export default ClassRoom;
