import asyncHandler from 'express-async-handler';
import Note from '../models/Note.js';
import cloudinary, { cloudinaryConfigured } from '../config/cloudinary.js';
import ClassRoom from '../models/ClassRoom.js';


const hasAlphabet = (text = '') => /[A-Za-z]/.test(text);

const isValidSubject = (subject = '') => /^[A-Za-z\s]+$/.test(subject.trim());

const isValidUrl = (url = '') => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

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
  if (req.query.classRoom) {
  const classExists = await ClassRoom.findOne({
    _id: req.query.classRoom,
    school: req.user.school,
  });

  if (!classExists) {
    res.status(404);
    throw new Error("Class not found");
  }

  filter.classRoom = req.query.classRoom;
}

  const notes = await Note.find(filter)
    .populate('classRoom', 'name section')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json(notes);
});

// @route  POST /api/notes   (teacher, admin)
export const createNote = asyncHandler(async (req, res) => {
  const {
  title,
  description,
  subject,
  classRoom,
  fileUrl,
  fileType,
} = req.body;

const normalizedSubject = subject?.trim() || "";

// Title validation

if (!title?.trim()) {
  res.status(400);
  throw new Error('Title is required');
}

if (!hasAlphabet(title)) {
  res.status(400);
  throw new Error('Title must contain alphabets');
}

// Description validation

if (description && !hasAlphabet(description)) {
  res.status(400);
  throw new Error('Description must contain alphabets');
}

// Subject Validation

if (!subject?.trim()) {
  res.status(400);
  throw new Error('Subject is required');
}

if (!isValidSubject(subject)) {
  res.status(400);
  throw new Error('Subject can contain only letters and spaces');
}

// class validation

if (!classRoom) {
  res.status(400);
  throw new Error('Class is required');
}

// File / Link Validation

if (!fileUrl?.trim()) {
  res.status(400);
  throw new Error('Please upload a file or provide a link');
}

if (fileType === 'link' && !isValidUrl(fileUrl)) {
  res.status(400);
  throw new Error('Please provide a valid URL');
}

const allowedFileTypes = ["image", "video", "raw", "link"];

if (fileType && !allowedFileTypes.includes(fileType)) {
  res.status(400);
  throw new Error("Invalid file type");
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
  (s) => s.name.toLowerCase() === normalizedSubject.toLowerCase()
);

if (!classSubject) {
  res.status(400);
  throw new Error("Subject is not assigned to this class");
}

if (
  req.user.role === "teacher" &&
  classSubject.teacher?.toString() !== req.user._id.toString()
) {
  res.status(403);
  throw new Error(
    "You can only upload notes for subjects assigned to you"
  );
}

  const note = await Note.create({
  title: title.trim(),
  description: description?.trim() || "",
  subject: normalizedSubject,
  classRoom,
  fileUrl: fileUrl?.trim() || "",
  fileName: req.body.fileName?.trim() || "",
  fileType: fileType || "",
  publicId: req.body.publicId || "",
  createdBy: req.user._id,
  school: req.user.school,
});

  const populated = await Note.findById(note._id)
  .populate('classRoom', 'name section')
  .populate('createdBy', 'name');

req.io
  .to(`school:${req.user.school}`)
  .emit('note:created');

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

  if (note.fileUrl && !note.fileType) {
    console.warn(`Missing fileType for note ${note._id}`);
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
    }catch (error) {
  console.error("Cloudinary cleanup failed:", error.message);
}
  }
  await note.deleteOne();

req.io
  .to(`school:${req.user.school}`)
  .emit('note:deleted');

res.json({
  message: 'Note removed',
});
});


// @route  PUT /api/notes/:id
// @access Teacher (owner), Admin
export const updateNote = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    fileUrl,
    fileName,
    fileType,
    publicId,
  } = req.body;

  const normalizedSubject = subject?.trim() || "";

  const note = await Note.findOne({
    _id: req.params.id,
    school: req.user.school,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (
    req.user.role === "teacher" &&
    note.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You can only edit your own notes");
  }

  // ---------- Validation ----------

  if (!title?.trim()) {
    res.status(400);
    throw new Error("Title is required");
  }

  if (!hasAlphabet(title)) {
    res.status(400);
    throw new Error("Title must contain alphabets");
  }

  if (description && !hasAlphabet(description)) {
    res.status(400);
    throw new Error("Description must contain alphabets");
  }

  if (!normalizedSubject) {
    res.status(400);
    throw new Error("Subject is required");
  }

  if (!isValidSubject(normalizedSubject)) {
    res.status(400);
    throw new Error("Subject can contain only letters and spaces");
  }

  if (!fileUrl?.trim()) {
    res.status(400);
    throw new Error("Please upload a file or provide a link");
  }

  if (fileType === "link" && !isValidUrl(fileUrl)) {
    res.status(400);
    throw new Error("Please provide a valid URL");
  }

  const allowedFileTypes = ["image", "video", "raw", "link"];

  if (fileType && !allowedFileTypes.includes(fileType)) {
    res.status(400);
    throw new Error("Invalid file type");
  }

  // ---------- Verify class & subject ----------

  // Class is locked after creation
  const classData = await ClassRoom.findOne({
    _id: note.classRoom,
    school: req.user.school,
  });

  if (!classData) {
    res.status(404);
    throw new Error("Class not found");
  }

  const classSubject = classData.subjects.find(
    (s) => s.name.toLowerCase() === normalizedSubject.toLowerCase()
  );

  if (!classSubject) {
    res.status(400);
    throw new Error("Subject is not assigned to this class");
  }

  if (
    req.user.role === "teacher" &&
    classSubject.teacher?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error(
      "You can only upload notes for subjects assigned to you"
    );
  }

  // ---------- Delete previous Cloudinary file if replaced ----------

  if (
    note.publicId &&
    publicId &&
    note.publicId !== publicId &&
    cloudinaryConfigured()
  ) {
    try {
      const resourceType =
        note.fileType === "image"
          ? "image"
          : note.fileType === "video"
          ? "video"
          : "raw";

      await cloudinary.uploader.destroy(note.publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      console.error(
        "Cloudinary cleanup failed:",
        error.message
      );
    }
  }

  // ---------- Update ----------

  note.title = title.trim();
  note.description = description?.trim() || "";
  note.subject = normalizedSubject;
  note.fileUrl = fileUrl.trim();
  note.fileName = fileName?.trim() || "";
  note.fileType = fileType || "";
  note.publicId = publicId || "";

  await note.save();

  const updated = await Note.findById(note._id)
  .populate("classRoom", "name section")
  .populate("createdBy", "name");

req.io
  .to(`school:${req.user.school}`)
  .emit("note:updated");

res.json(updated);
});