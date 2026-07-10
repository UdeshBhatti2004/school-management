import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, updateProfile, changePassword ,register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Max 10 attempts per IP per 15 minutes on login/register to slow down brute-force guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

router.post("/register", authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
