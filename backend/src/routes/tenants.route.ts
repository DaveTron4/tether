import { Router } from 'express';

import tenantController from '../controllers/tenants.controller.js';

const router = Router();

// Tenant routes

// Get all tenants (Super Admin only)
router.get('/', tenantController.getTenants);

// Create a new tenant (Super Admin only)
router.post('/', tenantController.createTenant);

// Update tenant details (Super Admin only)
router.put('/:id', tenantController.updateTenant);

// Delete a tenant (Super Admin only)
router.delete('/:id', tenantController.deleteTenant);


export default router;