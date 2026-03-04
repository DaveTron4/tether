import type { Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Controller functions for managing payment histories

// Get payment histories (with optional filters)
const getAllPaymentHistories = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { subscription_id } = req.query;

        let query = `
            SELECT 
                ph.id,
                ph.subscription_id,
                ph.amount_paid,
                ph.status,
                ph.created_at,
                s.service_type,
                s.carrier
            FROM payment_history ph
            JOIN subscriptions s ON ph.subscription_id = s.id
            WHERE ph.tenant_id = $1
        `;

        const params: any[] = [req.user.tenant_id];

        if (subscription_id) {
            query += ` AND ph.subscription_id = $2`;
            params.push(subscription_id);
        }

        query += ` ORDER BY ph.created_at DESC`;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Error fetching payment histories:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a single payment history by ID
const getPaymentHistoryById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        
        const query = `
            SELECT 
                ph.*, 
                s.service_type, 
                s.carrier 
            FROM payment_history ph
            JOIN subscriptions s ON ph.subscription_id = s.id
            WHERE ph.id = $1 AND ph.tenant_id = $2
        `;

        const result = await pool.query(query, [id, req.user.tenant_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment history not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching payment history:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new payment record
const createPayment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { subscription_id, amount_paid, status } = req.body;
        
        const result = await pool.query(
            `INSERT INTO payment_history (tenant_id, subscription_id, amount_paid, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.tenant_id, subscription_id, amount_paid, status]
        );

        if (status === 'Paid') {
            await pool.query(
                `UPDATE subscriptions SET last_payment_at = NOW(), status = 'Paid' WHERE id = $1 AND tenant_id = $2`,
                [subscription_id, req.user.tenant_id]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error recording payment:', err);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

export default {
    getAllPaymentHistories,
    getPaymentHistoryById,
    createPayment
};