import { Router } from 'express';
import clientRoutes from './clients.route.js';
import paymentHistoryRoutes from './paymentHistory.route.js';
import authRoutes from './auth.route.js';
import {verifyToken} from '../middleware/auth.middleware.js';

const router = Router();

// Auth
router.use('/auth', authRoutes);

// Protected routes
// Client routes
router.use('/clients', verifyToken as any, clientRoutes);

// Payment History routes
router.use('/payment-histories', verifyToken as any, paymentHistoryRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
