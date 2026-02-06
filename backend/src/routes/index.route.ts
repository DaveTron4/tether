import { Router } from 'express';
import {verifyToken} from '../middleware/auth.middleware.js';

// Route imports
import authRoutes from './auth.route.js';
import clientRoutes from './clients.route.js';
import paymentHistoryRoutes from './paymentHistory.route.js';
import subscriptionRoutes from './subscription.route.js';
import productRouter from './product.route.js';
import repairRoutes from './repair.route.js';

const router = Router();

// Auth
router.use('/auth', authRoutes);

// Protected routes
// Client routes
router.use('/clients', verifyToken as any, clientRoutes);

// Payment History routes
router.use('/payment-histories', verifyToken as any, paymentHistoryRoutes);

// Subscription routes
router.use('/subscriptions', verifyToken as any, subscriptionRoutes);

// Product routes
router.use('/products', verifyToken as any, productRouter);

// Repair routes
router.use('/repairs', verifyToken as any, repairRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
