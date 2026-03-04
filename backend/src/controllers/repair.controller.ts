import type { Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Controller functions for managing repairs

// Get all repairs
const getAllRepairs = async (req: AuthRequest, res: Response) => {
  try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const result = await pool.query('SELECT * FROM repair_tickets WHERE tenant_id = $1 ORDER BY id ASC', [req.user.tenant_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching repairs:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }  
};

// Get a single repair by ID
const getRepairById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM repair_tickets WHERE id = $1 AND tenant_id = $2', 
            [id, req.user.tenant_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Repair not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching repair:', err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
};

// Get repairs for a specific client
const getRepairsByClientId = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { client_id } = req.query;
        if (!client_id) {
            return res.status(400).json({ error: 'Client ID  is required' });
        }

        const result = await pool.query('SELECT * FROM repair_tickets WHERE client_id = $1 AND tenant_id = $2 ORDER BY created_at DESC', 
            [client_id, req.user.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No repairs found for this client' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching repairs for client:', err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
};

// Create new repair ticket
const createRepair = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { client_id, device_model, issue_description, status, estimated_cost, parts_cost, labor_cost, charge_amount } = req.body;

        // Validate required fields
        if (!client_id || !device_model || !issue_description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
            'INSERT INTO repair_tickets (tenant_id, client_id, device_model, issue_description, status, estimated_cost, parts_cost, labor_cost, charge_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [req.user.tenant_id, client_id, device_model, issue_description, status || 'Intake', estimated_cost || 0, parts_cost || 0, labor_cost || 0, charge_amount || 0]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating repair:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update an existing repair ticket
const updateRepair = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const { device_model, issue_description, status, estimated_cost, parts_cost, labor_cost, charge_amount } = req.body;

        const result = await pool.query(
            `UPDATE repair_tickets SET device_model = COALESCE($1, device_model), 
                issue_description = COALESCE($2, issue_description), 
                status = COALESCE($3, status), 
                estimated_cost = COALESCE($4, estimated_cost),
                parts_cost = COALESCE($5, parts_cost),
                labor_cost = COALESCE($6, labor_cost),
                charge_amount = COALESCE($7, charge_amount)
            WHERE id = $8 AND tenant_id = $9 RETURNING *`,
            [device_model, issue_description, status, estimated_cost, parts_cost, labor_cost, charge_amount, id, req.user.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Repair not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating repair:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a repair ticket
// (Optional: Implement if needed) 

export default {
    getAllRepairs,
    getRepairById,
    getRepairsByClientId,
    createRepair,
    updateRepair
};