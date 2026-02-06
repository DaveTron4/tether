import { Router } from 'express';
import saleController from '../controllers/sale.controller.js';
import { isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Sale routes

// Create a new sale (checkout)
router.post('/', saleController.createSale);

// Get all sales (for reporting)
router.get('/', isAdmin as any, saleController.getAllSales);

// Get sale details by ID (the receipt view)
router.get('/:id', saleController.getSaleById);

export default router;