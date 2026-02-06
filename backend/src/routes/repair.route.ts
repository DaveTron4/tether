import { Router } from 'express';
import repairController from '../controllers/repair.controller.js';
import { isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Repair routes
// Gets all repairs
router.get('/', repairController.getAllRepairs);

// Gets a single repair by ID
router.get('/:id', repairController.getRepairById);

// Gets repairs for a specific client
router.get('/by-client', repairController.getRepairsByClientId);

// Creates a new repair ticket
router.post('/', repairController.createRepair);

// Updates a repair ticket by ID
router.put('/:id', isAdmin as any, repairController.updateRepair);

export default router;