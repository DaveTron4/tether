import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/users — list users (admin sees own tenant, superadmin sees all)
router.get('/', isAdmin as any, userController.getAllUsers);

// GET /api/users/:id — get single user
router.get('/:id', isAdmin as any, userController.getUserById);

export default router;
