import type { Request, Response } from 'express';
import { pool } from '../config/database.js';

// Controller functions for managing payment histories

// Get all payment histories
const getAllPaymentHistories = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM payment_history ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching payment histories:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get payment history by ID
const getPaymentHistoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM payment_history WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment history not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching payment history:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default {
    getAllPaymentHistories,
    getPaymentHistoryById
};