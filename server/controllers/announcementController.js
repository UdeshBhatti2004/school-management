import asyncHandler from 'express-async-handler';
import Announcement from '../models/Announcement.js';
import { getIO } from "../socket/index.js";



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
  const title = req.body.title?.trim() || "";
const body = req.body.body?.trim() || "";

if (!title) {
  res.status(400);
  throw new Error("Title is required.");
}

if (!/[A-Za-z]/.test(title)) {
  res.status(400);
  throw new Error("Title must contain at least one letter.");
}

if (!body) {
  res.status(400);
  throw new Error("Message is required.");
}

if (!/[A-Za-z]/.test(body)) {
  res.status(400);
  throw new Error("Message must contain at least one letter.");
}

if (req.body.audience === "class" && !req.body.classRoom) {
  res.status(400);
  throw new Error("Please select a class.");
}

  const announcement = await Announcement.create({
  ...req.body,
  title,
  body,
  createdBy: req.user._id,
  school: req.user.school,
});
  const populated = await Announcement.findById(announcement._id)
  .populate("createdBy", "name role")
  .populate("classRoom", "name section");

if (announcement.audience === "class") {
  getIO()
    .to(`class:${announcement.classRoom}`)
    .emit("announcement:created");
} else {
  getIO()
    .to(`school:${req.user.school}`)
    .emit("announcement:created");
}

res.status(201).json(populated);
});



// @route PUT /api/announcements/:id
// @access admin, teacher
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOne({
    _id: req.params.id,
    school: req.user.school,
  });

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  if (
    req.user.role === "teacher" &&
    announcement.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You can only edit your own announcements");
  }

  const title = req.body.title?.trim() || "";
  const body = req.body.body?.trim() || "";

  if (!title) {
    res.status(400);
    throw new Error("Title is required.");
  }

  if (!/[A-Za-z]/.test(title)) {
    res.status(400);
    throw new Error("Title must contain at least one letter.");
  }

  if (!body) {
    res.status(400);
    throw new Error("Message is required.");
  }

  if (!/[A-Za-z]/.test(body)) {
    res.status(400);
    throw new Error("Message must contain at least one letter.");
  }

  if (req.body.audience === "class" && !req.body.classRoom) {
    res.status(400);
    throw new Error("Please select a class.");
  }

  announcement.title = title;
  announcement.body = body;
  announcement.audience = req.body.audience;
  announcement.classRoom =
    req.body.audience === "class" ? req.body.classRoom : undefined;

  announcement.attachmentUrl = req.body.attachmentUrl || "";
  announcement.attachmentName = req.body.attachmentName || "";

  await announcement.save();

if (announcement.audience === "class") {
  getIO()
    .to(`class:${announcement.classRoom}`)
    .emit("announcement:updated");
} else {
  getIO()
    .to(`school:${req.user.school}`)
    .emit("announcement:updated");
}

const populated = await Announcement.findById(announcement._id)
  .populate("createdBy", "name role")
  .populate("classRoom", "name section");

res.json(populated);
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
  const audience = announcement.audience;
const classRoomId = announcement.classRoom;

await announcement.deleteOne();

if (audience === "class") {
  getIO()
    .to(`class:${classRoomId}`)
    .emit("announcement:deleted");
} else {
  getIO()
    .to(`school:${req.user.school}`)
    .emit("announcement:deleted");
}

res.json({
  message: "Announcement removed",
});
});
