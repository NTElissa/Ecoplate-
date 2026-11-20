import { Router } from 'express';
import { home, createDonation, createMessage, subscribe } from '../controllers/publicController.js';
import { publicFormLimiter } from '../middlewares/rateLimit.js';

const router = Router();
router.get('/home', home);
router.post('/donations', publicFormLimiter, createDonation);
router.post('/messages', publicFormLimiter, createMessage);
router.post('/subscribe', publicFormLimiter, subscribe);
export default router;
