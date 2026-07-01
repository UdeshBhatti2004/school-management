import asyncHandler from 'express-async-handler';
import Announcement from '../models/Announcement.js';

// @route  GET /api/announcements
export const getAnnouncements = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let filter = {
  school: req.user.school,
};
  if (role === 'teacher') {
    filter = {
  school: req.user.school,
  audience: {
    $in: ['all', 'teachers'],
  },
};
  } else if (role === 'student') {
    filter = {
  school: req.user.school,
  $or: [
    {
      audience: {
        $in: ['all', 'students'],
      },
    },
    {
      audience: 'class',
      classRoom: req.user.classRoom,
    },
  ],
};
  }
  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'name role')
    .populate('classRoom', 'name section')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(announcements);
});

// @route  POST /api/announcements
// @access admin, teacher
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.status(400);
    throw new Error('Title and body are required');
  }
  const announcement = await Announcement.create({
  ...req.body,
  createdBy: req.user._id,
  school: req.user.school,
});
  const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name role');
  res.status(201).json(populated);
});

// @route  DELETE /api/announcements/:id
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  if (req.user.role === 'teacher' && announcement.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own announcements');
  }
  await announcement.deleteOne();
  res.json({ message: 'Announcement removed' });
});
