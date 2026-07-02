import express from 'express';
import { login, getMe, updateProfile, changePassword ,register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post("/register", register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
