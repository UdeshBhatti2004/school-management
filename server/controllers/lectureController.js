import asyncHandler from 'express-async-handler';
import Lecture from '../models/Lecture.js';
import cloudinary, { cloudinaryConfigured } from '../config/cloudinary.js';

// @route  GET /api/lectures
// Students see their class; teachers see their own; admin sees all
export const getLectures = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') {
    if (!req.user.classRoom) return res.json([]);
    filter.classRoom = req.user.classRoom;
  } else if (req.user.role === 'teacher') {
    filter.createdBy = req.user._id;
  }
  if (req.query.classRoom) filter.classRoom = req.query.classRoom;

  const lectures = await Lecture.find(filter)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json(lectures);
});

// @route  POST /api/lectures
// @access teacher, admin
export const createLecture = asyncHandler(async (req, res) => {
  const { title, classRoom, videoUrl } = req.body;
  if (!title || !classRoom || !videoUrl) {
    res.status(400);
    throw new Error('Title, class and a video URL are required');
  }
  const lecture = await Lecture.create({ ...req.body, createdBy: req.user._id });
  const populated = await Lecture.findById(lecture._id)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name');
  res.status(201).json(populated);
});

// @route  PUT /api/lectures/:id
export const updateLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }
  if (req.user.role === 'teacher' && lecture.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own lectures');
  }
  ['title', 'description', 'subject', 'classRoom', 'videoUrl', 'sourceType', 'thumbnail', 'durationMinutes'].forEach(
    (f) => {
      if (req.body[f] !== undefined) lecture[f] = req.body[f];
    }
  );
  await lecture.save();
  res.json(lecture);
});

// @route  DELETE /api/lectures/:id
export const deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }
  if (req.user.role === 'teacher' && lecture.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own lectures');
  }
  if (lecture.sourceType === 'upload' && lecture.publicId && cloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(lecture.publicId, { resource_type: 'video' });
    } catch {
      /* ignore cleanup failure */
    }
  }
  await lecture.deleteOne();
  res.json({ message: 'Lecture removed' });
});
