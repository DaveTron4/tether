import { Router } from 'express';
import productController from '../controllers/product.controller.js';
import { isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Product routes
// Gets all products
router.get('/', productController.getAllProducts);

// Gets a single product by ID
router.get('/:id', productController.getProductById);

// Creates a new product
router.post('/', isAdmin as any, productController.createProduct);

// Deletes a product by ID
router.delete('/:id', isAdmin as any, productController.deleteProductById);

// Updates a product by ID
router.put('/:id', isAdmin as any, productController.updateProductById);

export default router;