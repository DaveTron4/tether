import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createCheckoutSession, createBillingPortalSession, getSubscriptionStatus } from '../controllers/stripe.controller.js';

const router = Router();

// Public: New tenant signup → Stripe Checkout
router.post('/checkout', createCheckoutSession as any);

// Webhook is handled at the app level in index.ts (needs raw body before express.json())

// Authenticated: Admin manages billing via Stripe Portal
router.post('/billing-portal', verifyToken as any, createBillingPortalSession as any);

// Authenticated: Check current subscription status
router.get('/subscription-status', verifyToken as any, getSubscriptionStatus as any);

export default router;
