import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

// Keep files in memory, then stream to Cloudinary. 200MB cap (Cloudinary free tier is smaller for video).
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
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
