import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(new Error(err.message || 'Upload failed'));
    }
    next();
  });
};

router.post('/', protect, authorize('teacher', 'admin', 'student'), handleUpload, uploadFile);

export default router;
