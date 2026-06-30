import express from 'express';
import { getNotes, createNote, deleteNote } from '../controllers/noteController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotes)
  .post(authorize('teacher', 'admin'), createNote);
router.delete('/:id', authorize('teacher', 'admin'), deleteNote);

export default router;
