import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

// Keep this in sync with client/src/lib/uploadConfig.js ALLOWED_EXTENSIONS.
// The client already filters by extension, but that check is client-side only
// and can be bypassed by calling this endpoint directly - enforce it here too.
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv',
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'zip', 'rar',
  'mp4', 'mov', 'avi', 'mkv',
];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('This file type is not supported.'));
  }
  cb(null, true);
};

// Keep files in memory, then stream to Cloudinary. 200MB cap (Cloudinary free tier is smaller for video).
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter,
});

// Upload a buffer to Cloudinary. resourceType: 'video' | 'image' | 'raw' | 'auto'
export const uploadToCloudinary = (buffer, { folder = 'scholora', resourceType = 'auto', filename } = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: filename, use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
