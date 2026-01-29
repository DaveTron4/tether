import { Router } from 'express';
import paymentHistoryController from '../controllers/paymentHistory.controller.js';


const router = Router();

// Payment History routes
// Gets all payment histories
router.get('/', paymentHistoryController.getAllPaymentHistories);

// Gets a single payment history by ID
router.get('/:id', paymentHistoryController.getPaymentHistoryById);

export default router;