import { Router } from 'express';
import clientController from '../controllers/client.controller.js';
import { isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Client routes
// Gets all clients
router.get('/', clientController.getAllClients);

// Gets client summary (must be before /:id to avoid conflict)
router.get('/:id/summary', clientController.getClientSummary);

// Gets a single client by ID
router.get('/:id', clientController.getClientById);

// Creates a new client
router.post('/', isAdmin as any, clientController.createClient);

// Updates an existing client
router.put('/:id', isAdmin as any, clientController.updateClient);

// Deletes a client
router.delete('/:id', isAdmin as any, clientController.deleteClient);

export default router;
