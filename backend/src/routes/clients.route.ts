import { Router } from 'express';
import clientController from '../controllers/client.controller.js';

const router = Router();

// Client routes
// Gets all clients
router.get('/', clientController.getAllClients);

// Gets a single client by ID
router.get('/:id', clientController.getClientById);

// Creates a new client
router.post('/', clientController.createClient);

// Updates an existing client
router.put('/:id', clientController.updateClient);

// Deletes a client
router.delete('/:id', clientController.deleteClient);

export default router;
