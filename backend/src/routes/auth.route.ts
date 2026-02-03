import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

const router = Router();

// Auth routes
// User login
router.post('/login', authController.login);

// User registration
router.post('/register', authController.register);

export default router;