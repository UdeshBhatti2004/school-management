import asyncHandler from 'express-async-handler';
import Lecture from '../models/Lecture.js';
import cloudinary, { cloudinaryConfigured } from '../config/cloudinary.js';
import mongoose from 'mongoose';
import ClassRoom from '../models/ClassRoom.js';
import { getIO } from "../socket/index.js"

// @route  GET /api/lectures
// Students see their class; teachers see their own; admin sees all
export const getLectures = asyncHandler(async (req, res) => {
  const filter = {
  school: req.user.school,
};
  if (req.user.role === 'student') {
    if (!req.user.classRoom) return res.json([]);
    filter.classRoom = req.user.classRoom;
  } else if (req.user.role === 'teacher') {
    filter.createdBy = req.user._id;
  }
if (req.user.role === 'admin' && req.query.classRoom) {
  if (!mongoose.Types.ObjectId.isValid(req.query.classRoom)) {
    res.status(400);
    throw new Error('Invalid class ID');
  }

  filter.classRoom = req.query.classRoom;
}

  const lectures = await Lecture.find(filter)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json(lectures);
});

// @route  POST /api/lectures
// @access teacher, admin
export const createLecture = asyncHandler(async (req, res) => {
  const {
  title,
  description,
  subject,
  classRoom,
  videoUrl,
  sourceType,
  thumbnail,
  durationMinutes,
  publicId,
} = req.body;



if (!title?.trim()) {
  res.status(400);
  throw new Error('Lecture title is required');
}

/// Title Validation

const trimmedTitle = title.trim();

if (trimmedTitle.length < 3) {
  res.status(400);
  throw new Error('Lecture title must be at least 3 characters long');
}

if (trimmedTitle.length > 120) {
  res.status(400);
  throw new Error('Lecture title cannot exceed 120 characters');
}

if (!/[A-Za-z]/.test(trimmedTitle)) {
  res.status(400);
  throw new Error('Lecture title must contain at least one alphabet');
}


/// Description validation 


const trimmedDescription = description?.trim() || '';

if (trimmedDescription.length > 1000) {
  res.status(400);
  throw new Error('Description cannot exceed 1000 characters');
}

if (trimmedDescription && !/[A-Za-z]/.test(trimmedDescription)) {
  res.status(400);
  throw new Error('Description must contain at least one alphabet');
}


if (!subject?.trim()) {
  res.status(400);
  throw new Error('Subject is required');
}

const normalizedSubject = subject.trim().toLowerCase();


/// Subject Validation

const trimmedSubject = subject.trim();

if (trimmedSubject.length > 100) {
  res.status(400);
  throw new Error('Subject cannot exceed 100 characters');
}

if (!/[A-Za-z]/.test(trimmedSubject)) {
  res.status(400);
  throw new Error('Subject must contain at least one alphabet');
}



if (!classRoom) {
  res.status(400);
  throw new Error('Class is required');
}

if (!videoUrl?.trim()) {
  res.status(400);
  throw new Error('Video URL is required');
}

if (!mongoose.Types.ObjectId.isValid(classRoom)) {
  res.status(400);
  throw new Error('Invalid class ID');
}

const classData = await ClassRoom.findOne({
  _id: classRoom,
  school: req.user.school,
});

if (!classData) {
  res.status(404);
  throw new Error('Class not found');
}

const classSubject = classData.subjects.find(
  (s) => s.name.toLowerCase() === normalizedSubject
);

if (!classSubject) {
  res.status(400);
  throw new Error('Selected subject does not exist for this class');
}


if (
  req.user.role === 'teacher' &&
  classSubject.teacher?.toString() !== req.user._id.toString()
) {
  res.status(403);
  throw new Error(
    'You are not assigned to teach this subject for the selected class'
  );
}


/// Link Validation

if (!['link', 'upload'].includes(sourceType)) {
  res.status(400);
  throw new Error('Invalid source type');
}

/// Duration Validation

if (
  durationMinutes !== undefined &&
  (Number(durationMinutes) < 0 || Number(durationMinutes) > 600)
) {
  res.status(400);
  throw new Error('Duration must be between 0 and 600 minutes');
}


/// URL Validation

try {
  new URL(videoUrl.trim());
} catch {
  res.status(400);
  throw new Error('Invalid video URL');
}

/// Thumbnail Validation

if (thumbnail?.trim()) {
  try {
    new URL(thumbnail.trim());
  } catch {
    res.status(400);
    throw new Error('Invalid thumbnail URL');
  }
}

// Upload Validation

if (sourceType === 'upload' && !publicId?.trim()) {
  res.status(400);
  throw new Error('Public ID is required for uploaded videos');
}



  const lecture = await Lecture.create({
  title: trimmedTitle,
  description: trimmedDescription,
  subject: trimmedSubject,
  classRoom,
  videoUrl: videoUrl.trim(),
  sourceType,
  thumbnail: thumbnail?.trim() || '',
  durationMinutes: Number(durationMinutes) || 0,
  publicId: publicId?.trim() || '',
  createdBy: req.user._id,
  school: req.user.school,
});



  const populated = await Lecture.findById(lecture._id)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name');

getIO().to(`school:${req.user.school}`).emit("lecture:created", populated);

  res.status(201).json(populated);
});

// @route  PUT /api/lectures/:id
  export const updateLecture = asyncHandler(async (req, res) => {


    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid lecture ID');
  }


    const lecture = await Lecture.findOne({
    _id: req.params.id,
    school: req.user.school,
  });


    if (!lecture) {
      res.status(404);
      throw new Error('Lecture not found');
    }
    if (req.user.role === 'teacher' && lecture.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only edit your own lectures');
    }

    
  const oldPublicId = lecture.publicId;
  const oldSourceType = lecture.sourceType;

    const {
    title,
    description,
    subject,
    classRoom,
    videoUrl,
    sourceType,
    thumbnail,
    durationMinutes,
    publicId,
  } = req.body;


  ////  Field validaton

  let trimmedTitle;
  let trimmedDescription;
  let trimmedSubject;

  if (title != null) {
    trimmedTitle = title.trim();

    if (!trimmedTitle) {
      res.status(400);
      throw new Error('Lecture title is required');
    }

    if (trimmedTitle.length < 3 || trimmedTitle.length > 120) {
      res.status(400);
      throw new Error('Lecture title must be between 3 and 120 characters');
    }

    if (!/[A-Za-z]/.test(trimmedTitle)) {
      res.status(400);
      throw new Error('Lecture title must contain at least one alphabet');
    }
  }

if (description != null) {
  
  trimmedDescription = description.trim();

    if (trimmedDescription.length > 1000) {
      res.status(400);
      throw new Error('Description cannot exceed 1000 characters');
    }

    if (
      trimmedDescription &&
      !/[A-Za-z]/.test(trimmedDescription)
    ) {
      res.status(400);
      throw new Error('Description must contain at least one alphabet');
    }
  }

  if (subject != null) {
    trimmedSubject = subject.trim();

    if (!trimmedSubject) {
      res.status(400);
      throw new Error('Subject is required');
    }

    if (trimmedSubject.length > 100) {
      res.status(400);
      throw new Error('Subject cannot exceed 100 characters');
    }

    if (!/[A-Za-z]/.test(trimmedSubject)) {
      res.status(400);
      throw new Error('Subject must contain at least one alphabet');
    }
  }

  if (videoUrl != null) {
    try {
      new URL(videoUrl.trim());
    } catch {
      res.status(400);
      throw new Error('Invalid video URL');
    }
  }

  if (thumbnail?.trim()) {
    try {
      new URL(thumbnail.trim());
    } catch {
      res.status(400);
      throw new Error('Invalid thumbnail URL');
    }
  }


  if (
    durationMinutes!=null &&
    (Number(durationMinutes) < 0 ||
      Number(durationMinutes) > 600)
  ) {
    res.status(400);
    throw new Error(
      'Duration must be between 0 and 600 minutes'
    );
  }

  const finalSourceType = sourceType ?? lecture.sourceType;

  if (!['link', 'upload'].includes(finalSourceType)) {
    res.status(400);
    throw new Error('Invalid source type');
  }

  const finalPublicId = publicId?.trim() || lecture.publicId;

  if (
    finalSourceType === 'upload' &&
    !finalPublicId
  ) {
    res.status(400);
    throw new Error(
      'Public ID is required for uploaded videos'
    );
  }


  let classData;

  if (classRoom!=null) {
    if (!mongoose.Types.ObjectId.isValid(classRoom)) {
      res.status(400);
      throw new Error('Invalid class ID');
    }

    classData = await ClassRoom.findOne({
      _id: classRoom,
      school: req.user.school,
    });

    if (!classData) {
      res.status(404);
      throw new Error('Class not found');
    }
  }

    // Subject and Teacher validation

  if (classRoom!=null || subject!=null) {
    const targetClass =
      classData ||
      (await ClassRoom.findOne({
        _id: lecture.classRoom,
        school: req.user.school,
      }));

const targetSubject = trimmedSubject ?? lecture.subject;


    const classSubject = targetClass.subjects.find(
      (s) =>
        s.name.toLowerCase() === targetSubject.toLowerCase()
    );

    if (!classSubject) {
      res.status(400);
      throw new Error(
        'Selected subject does not exist for this class'
      );
    }

    if (
      req.user.role === 'teacher' &&
      classSubject.teacher?.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error(
        'You are not assigned to teach this subject for the selected class'
      );
    }
  }

  if (title!=null) lecture.title = trimmedTitle;

  if (description!=null)
    lecture.description = trimmedDescription;

  if (subject!=null)
    lecture.subject = trimmedSubject;

  if (classRoom!=null)
    lecture.classRoom = classRoom;

  if (videoUrl!=null)
    lecture.videoUrl = videoUrl.trim();

  if (sourceType!=null)
    lecture.sourceType = sourceType;

  if (thumbnail!=null)
    lecture.thumbnail = thumbnail?.trim() || '';

  if (durationMinutes!=null)
    lecture.durationMinutes = Number(durationMinutes);

  if (publicId!=null)
    lecture.publicId = publicId?.trim() || '';



  if (
    oldSourceType === 'upload' &&
    finalSourceType === 'upload' &&
    oldPublicId &&
    oldPublicId !== finalPublicId &&
    cloudinaryConfigured()
  ) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: 'video',
      });
    } catch {
      // Ignore cleanup failure
    }
  }


  if (
    oldSourceType === 'upload' &&
    finalSourceType === 'link' &&
    oldPublicId &&
    cloudinaryConfigured()
  ) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: 'video',
      });
    } catch {
      // Ignore cleanup failure
    }
  }


  await lecture.save();

const updatedLecture = await Lecture.findById(lecture._id)
  .populate('classRoom', 'name section')
  .populate('createdBy', 'name');

getIO().to(`school:${req.user.school}`).emit("lecture:updated", updatedLecture);

res.json(updatedLecture);
  });

// @route  DELETE /api/lectures/:id
export const deleteLecture = asyncHandler(async (req, res) => {

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  res.status(400);
  throw new Error('Invalid lecture ID');
}


  const lecture = await Lecture.findOne({
  _id: req.params.id,
  school: req.user.school,
});
  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }
  if (req.user.role === 'teacher' && String(lecture.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own lectures');
  }
  if (
  lecture.sourceType === 'upload' &&
  lecture.publicId &&
  cloudinaryConfigured()
) {
  try {
    await cloudinary.uploader.destroy(lecture.publicId, {
      resource_type: 'video',
    });
  } catch (error) {
    console.error('Cloudinary cleanup failed:', error.message);
  }
}

const lectureId = lecture._id.toString();

await lecture.deleteOne();

getIO().to(`school:${req.user.school}`).emit("lecture:deleted", lecture._id);

res.json({ message: 'Lecture removed' });
});
