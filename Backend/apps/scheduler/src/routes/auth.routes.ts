import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.post('/send-otp', requireAuth, authController.sendOtp);
router.post('/verify-otp', requireAuth, authController.verifyOtp);

export default router;
