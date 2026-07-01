import asyncHandler from 'express-async-handler';
import Note from '../models/Note.js';
import cloudinary, { cloudinaryConfigured } from '../config/cloudinary.js';

// @route  GET /api/notes   (role-scoped)
export const getNotes = asyncHandler(async (req, res) => {
  const filter = {
  school: req.user.school,
};
  if (req.user.role === 'student') {
    if (!req.user.classRoom) return res.json([]);
    filter.classRoom = req.user.classRoom;
  } else if (req.user.role === 'teacher') {
    filter.createdBy = req.user._id;
  }
  if (req.query.classRoom) filter.classRoom = req.query.classRoom;

  const notes = await Note.find(filter)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json(notes);
});

// @route  POST /api/notes   (teacher, admin)
export const createNote = asyncHandler(async (req, res) => {
  const { title, classRoom } = req.body;
  if (!title || !classRoom) {
    res.status(400);
    throw new Error('Title and class are required');
  }
  const note = await Note.create({
  ...req.body,
  createdBy: req.user._id,
  school: req.user.school,
});
  const populated = await Note.findById(note._id)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name');
  res.status(201).json(populated);
});

// @route  DELETE /api/notes/:id   (teacher owner, admin)
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  if (req.user.role === 'teacher' && note.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own notes');
  }
  // Best-effort Cloudinary cleanup
  if (note.publicId && cloudinaryConfigured()) {
    const resourceType = note.fileType === 'image' ? 'image' : note.fileType === 'video' ? 'video' : 'raw';
    try {
      await cloudinary.uploader.destroy(note.publicId, { resource_type: resourceType });
    } catch {
      /* ignore cleanup failure */
    }
  }
  await note.deleteOne();
  res.json({ message: 'Note removed' });
});
