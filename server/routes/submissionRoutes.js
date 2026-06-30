import express from 'express';
import { gradeSubmission } from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

export default router;
