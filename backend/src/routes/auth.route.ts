import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import { requireLimit } from '../middleware/featureGate.middleware.js';

const router = Router();

// Auth routes
// User login
router.post('/login', authController.login);

// User registration (enforces employee plan limit)
router.post('/register', verifyToken, isAdmin, requireLimit('maxEmployees') as any, authController.register);

export default router;