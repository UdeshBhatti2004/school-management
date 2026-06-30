import express from 'express';
import {
  getClasses, getClassById, createClass, updateClass, deleteClass,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Any authenticated user can read classes (for dropdowns, scoping, etc.)
router.get('/', protect, getClasses);
router.get('/:id', protect, getClassById);

// Only admin can mutate
router.post('/', protect, authorize('admin'), createClass);
router.put('/:id', protect, authorize('admin'), updateClass);
router.delete('/:id', protect, authorize('admin'), deleteClass);

export default router;
