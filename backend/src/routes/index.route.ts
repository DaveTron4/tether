import { Router } from 'express';
import clientRoutes from './clients.route.js';
import paymentHistoryRoutes from './paymentHistory.route.js';
import authRoutes from './auth.route.js';

const router = Router();

// Client routes
router.use('/clients', clientRoutes);

// Payment History routes
router.use('/payment-histories', paymentHistoryRoutes);

// Auth
router.use('/auth', authRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
