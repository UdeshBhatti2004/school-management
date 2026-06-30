import asyncHandler from 'express-async-handler';
import { uploadToCloudinary } from '../middleware/upload.js';
import { cloudinaryConfigured } from '../config/cloudinary.js';

const detectType = (mimetype) => {
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'image';
  return 'raw'; // pdf, doc, etc.
};

// @route  POST /api/upload   (multipart, field name: "file")
// @access teacher, admin
export const uploadFile = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured()) {
    res.status(503);
    throw new Error(
      'File uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server .env, or paste a link instead.'
    );
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No file received');
  }

  const resourceType = detectType(req.file.mimetype);
  const result = await uploadToCloudinary(req.file.buffer, {
    resourceType,
    filename: req.file.originalname.replace(/\.[^.]+$/, ''),
  });

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
    resourceType,
    fileName: req.file.originalname,
    bytes: result.bytes,
  });
});
