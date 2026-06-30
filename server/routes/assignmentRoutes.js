import express from 'express';
import {
  getAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment,
} from '../controllers/assignmentController.js';
import {
  submitAssignment, getSubmissions, gradeSubmission,
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('teacher', 'admin'), createAssignment);

router.route('/:id')
  .get(getAssignmentById)
  .put(authorize('teacher', 'admin'), updateAssignment)
  .delete(authorize('teacher', 'admin'), deleteAssignment);

router.post('/:id/submit', authorize('student'), submitAssignment);
router.get('/:id/submissions', authorize('teacher', 'admin'), getSubmissions);

export default router;
