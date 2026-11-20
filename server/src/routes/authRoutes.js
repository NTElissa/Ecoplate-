import { Router } from 'express';
import { login, me, changePassword, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimit.js';

const router = Router();
// No fixed /login route exists. The path segment comes from ADMIN_LOGIN_PATH in .env.
router.post('/access/:slug/login', loginLimiter, login);
router.get('/auth/me', protect, me);
router.put('/auth/password', protect, changePassword);
router.put('/auth/profile', protect, updateProfile);
export default router;
