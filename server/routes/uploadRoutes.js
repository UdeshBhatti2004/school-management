import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('teacher', 'admin'), upload.single('file'), uploadFile);

export default router;
