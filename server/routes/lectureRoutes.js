import express from 'express';
import {
  getLectures, createLecture, updateLecture, deleteLecture,
} from '../controllers/lectureController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getLectures)
  .post(authorize('teacher', 'admin'), createLecture);

router.route('/:id')
  .put(authorize('teacher', 'admin'), updateLecture)
  .delete(authorize('teacher', 'admin'), deleteLecture);

export default router;
