import express from 'express';
import {
  markAttendance, getAttendance, getMyAttendance, getClassSummary,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', authorize('student'), getMyAttendance);
router.get('/summary', authorize('admin', 'teacher'), getClassSummary);
router.route('/')
  .get(authorize('admin', 'teacher'), getAttendance)
  .post(authorize('teacher', 'admin'), markAttendance);

export default router;
