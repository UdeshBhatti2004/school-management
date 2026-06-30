import express from 'express';
import {
  getFees, getFeeSummary, createFee, recordPayment, updateFee, deleteFee,
} from '../controllers/feeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', authorize('admin'), getFeeSummary);
router.route('/')
  .get(getFees) // role-scoped inside controller
  .post(authorize('admin'), createFee);
router.put('/:id/pay', authorize('admin'), recordPayment);
router.route('/:id')
  .put(authorize('admin'), updateFee)
  .delete(authorize('admin'), deleteFee);

export default router;
