import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Auth routes
// User login
router.post('/login', authController.login);

// User registration
router.post('/register', verifyToken, isAdmin, authController.register);

export default router;