import { Router } from 'express';
import deviceController from '../controllers/device.controller.js';
import { isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Device routes (Mounted under /api/devices)

// Get all devices for the store
router.get('/', deviceController.getAllDevices);

// Get all devices belonging to a specific client (must be before /:id to avoid collision)
router.get('/client/:client_id', deviceController.getDevicesByClientId);

// Get a single device by ID
router.get('/:id', deviceController.getDeviceById);

// Create a new device
router.post('/', isAdmin as any, deviceController.createDevice);

// Update an existing device
router.put('/:id', isAdmin as any, deviceController.updateDevice);

// Delete a device
router.delete('/:id', isAdmin as any, deviceController.deleteDevice);

export default router;