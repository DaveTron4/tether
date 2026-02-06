import type { Request, Response } from 'express';
import { pool } from '../config/database.js';

// Controller functions for managing subscriptions

// Get all client subscriptions
const getClientSubscriptions = async (req: Request, res: Response) => {
    try {
        const { client_id } = req.query;
        
        if (!client_id) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        const result = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE client_id = $1 
             ORDER BY is_active DESC, created_at DESC`, 
            [client_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No subscriptions found for this client' });
        }
        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new Subscription
const createSubscription = async (req: Request, res: Response) => {
    try {
        const { client_id, service_type, carrier, plan_amount, payment_due_day } = req.body;

        const result = await pool.query(
            `INSERT INTO subscriptions 
             (client_id, service_type, carrier, plan_amount, payment_due_day, status)
             VALUES ($1, $2, $3, $4, $5, 'Unpaid')
             RETURNING *`,
            [client_id, service_type, carrier, plan_amount, payment_due_day]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Could not create subscription' });
    }
};

// Update an existing Subscription
const updateSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { plan_amount, is_active, status } = req.body;

        const result = await pool.query(
            `UPDATE subscriptions 
             SET plan_amount = COALESCE($1, plan_amount),
                 is_active = COALESCE($2, is_active),
                 status = COALESCE($3, status)
             WHERE id = $4 
             RETURNING *`,
            [plan_amount, is_active, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

export default { 
    getClientSubscriptions, 
    createSubscription, 
    updateSubscription 
};