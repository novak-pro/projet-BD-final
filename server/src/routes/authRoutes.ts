import { Router } from 'express';
import * as authController from '../controllers/authController';
import {protect, authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', protect, authenticateToken, authController.getMe );

export default router;
