import { Router } from 'express';
import { isSuperAdmin, verifyToken } from '../middleware/auth.middleware.js';
import { requireActiveSubscription } from '../middleware/subscription.middleware.js';
import { requireFeature } from '../middleware/featureGate.middleware.js';

// Route imports
import authRoutes from './auth.route.js';
import clientRoutes from './clients.route.js';
import deviceRoutes from './device.route.js'; // 👈 1. Import device routes
import paymentHistoryRoutes from './paymentHistory.route.js';
import subscriptionRoutes from './subscription.route.js';
import productRouter from './product.route.js';
import repairRoutes from './repair.route.js';
import saleRoutes from './sale.route.js';
import tenantRoutes from './tenants.route.js';
import userRoutes from './user.route.js';
import stripeRoutes from './stripe.route.js';

const router = Router();

// Super Admin routes
router.use('/tenants', isSuperAdmin as any, tenantRoutes);

// Stripe routes
router.use('/stripe', stripeRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Client routes
router.use('/clients', verifyToken as any, requireActiveSubscription as any, clientRoutes);

// Device routes
router.use('/devices', verifyToken as any, requireActiveSubscription as any, deviceRoutes); // 👈 2. Register device routes

// Payment History routes
router.use('/payment-histories', verifyToken as any, requireActiveSubscription as any, paymentHistoryRoutes);

// Subscription routes
router.use('/subscriptions', verifyToken as any, requireActiveSubscription as any, requireFeature('subscriptions') as any, subscriptionRoutes);

// Product routes
router.use('/products', verifyToken as any, requireActiveSubscription as any, productRouter);

// Repair routes
router.use('/repairs', verifyToken as any, requireActiveSubscription as any, requireFeature('repairs') as any, repairRoutes);

// Sale routes
router.use('/sales', verifyToken as any, requireActiveSubscription as any, saleRoutes);

// User routes
router.use('/users', verifyToken as any, requireActiveSubscription as any, userRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;