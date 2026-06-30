import express from 'express';
import {
  getAnnouncements, createAnnouncement, deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorize('admin', 'teacher'), createAnnouncement);

router.delete('/:id', authorize('admin', 'teacher'), deleteAnnouncement);

export default router;
