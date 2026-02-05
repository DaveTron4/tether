import { Router } from 'express';
import subscriptionController from '../controllers/subscription.controller.js';
import { isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Subscription routes
// Gets all subscriptions
router.get('/', subscriptionController.getClientSubscriptions);

// Creates a new Subscription
router.post('/', isAdmin as any, subscriptionController.createSubscription);

// Updates a subscription by ID
router.put('/:id', isAdmin as any, subscriptionController.updateSubscription);