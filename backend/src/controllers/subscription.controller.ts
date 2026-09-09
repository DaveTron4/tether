import type { Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Controller functions for managing subscriptions

// Get all client subscriptions
const getClientSubscriptions = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { client_id } = req.query;
        
        if (!client_id) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        console.log('Fetching subscriptions for client:', { client_id, tenant_id: req.user.tenant_id });

        const result = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE client_id = $1 AND tenant_id = $2
             ORDER BY is_active DESC, created_at DESC`, 
            [client_id, req.user.tenant_id]
        );

        console.log('Found subscriptions:', result.rows.length);
        
        if (result.rows.length === 0) {
            return res.status(200).json([]);
        }
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        res.status(500).json({ error: 'Server error', details: err instanceof Error ? err.message : 'Unknown error' });
    }
};

// Create a new Subscription
const createSubscription = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { client_id, service_type, carrier, plan_amount, payment_due_day } = req.body;

        // Validate required fields
        if (!client_id || !service_type || !carrier || !plan_amount) {
            return res.status(400).json({ error: 'Missing required fields: client_id, service_type, carrier, plan_amount' });
        }

        console.log('Creating subscription:', { tenant_id: req.user.tenant_id, client_id, service_type, carrier, plan_amount, payment_due_day });

        const result = await pool.query(
            `INSERT INTO subscriptions 
             (tenant_id, client_id, service_type, carrier, plan_amount, payment_due_day, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'Unpaid')
             RETURNING *`,
            [req.user.tenant_id, client_id, service_type, carrier, plan_amount, payment_due_day]
        );

        console.log('Subscription created successfully:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating subscription:', err);
        res.status(500).json({ error: 'Could not create subscription', details: err instanceof Error ? err.message : 'Unknown error' });
    }
};

// Update an existing Subscription
const updateSubscription = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const { plan_amount, is_active, status } = req.body;

        const result = await pool.query(
            `UPDATE subscriptions 
             SET plan_amount = COALESCE($1, plan_amount),
                 is_active = COALESCE($2, is_active),
                 status = COALESCE($3, status)
             WHERE id = $4 AND tenant_id = $5
             RETURNING *`,
            [plan_amount, is_active, status, id, req.user.tenant_id]
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