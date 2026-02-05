import type { Request, Response } from 'express';
import { pool } from '../config/database.js';

// Controller functions for managing payment histories

// Get payment histories (with optional filters)
const getAllPaymentHistories = async (req: Request, res: Response) => {
    try {
        const { subscription_id } = req.query;

        let query = `
            SELECT 
                ph.id,
                ph.subscription_id,
                ph.amount_paid,
                ph.status,
                ph.created_at,
                -- We JOIN to get the plan details so the UI says "T-Mobile" instead of "ID 5"
                s.service_type,
                s.carrier
            FROM payment_history ph
            JOIN subscriptions s ON ph.subscription_id = s.id
        `;

        const params: any[] = [];

        if (subscription_id) {
            query += ` WHERE ph.subscription_id = $1`;
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
const getPaymentHistoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                ph.*, 
                s.service_type, 
                s.carrier 
            FROM payment_history ph
            JOIN subscriptions s ON ph.subscription_id = s.id
            WHERE ph.id = $1
        `;

        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment history not found' });
        }
        
        // Now the result will have "carrier": "T-Mobile" inside it
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching payment history:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new payment record
const createPayment = async (req: Request, res: Response) => {
    try {
        const { subscription_id, amount_paid, status } = req.body;
        
        // 1. Record the payment
        const result = await pool.query(
            `INSERT INTO payment_history (subscription_id, amount_paid, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [subscription_id, amount_paid, status]
        );

        // 2. OPTIONAL: Update the subscription 'last_payment_at' automatically
        if (status === 'Paid') {
            await pool.query(
                `UPDATE subscriptions SET last_payment_at = NOW(), status = 'Paid' WHERE id = $1`,
                [subscription_id]
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