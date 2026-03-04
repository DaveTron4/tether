import type { Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Controller functions for managing sales

// Create a new Sale (Checkout Process)
const createSale = async (req: AuthRequest, res: Response) => {
    const client = await pool.connect(); 
    
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { user_id, client_id, payment_method, items, card_token } = req.body;

        // Calculate Total
        const total_amount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // START TRANSACTION
        await client.query('BEGIN');

        // =========================================================
        // STEP A: Create Database Records (Pending State)
        // =========================================================
        
        // Insert Header
        const saleRes = await client.query(
            `INSERT INTO sales (tenant_id, user_id, client_id, total_amount, payment_method)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, created_at`,
            [req.user.tenant_id, user_id, client_id, total_amount, payment_method]
        );
        const saleId = saleRes.rows[0].id;
        const saleDate = saleRes.rows[0].created_at;

        // Insert Items & Update Stock
        for (const item of items) {
            await client.query(
                `INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale)
                 VALUES ($1, $2, $3, $4)`,
                [saleId, item.product_id, item.quantity, item.price]
            );

            await client.query(
                `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND tenant_id = $3`,
                [item.quantity, item.product_id, req.user.tenant_id]
            );
        }

        // =========================================================
        // STEP B: The "Ghost Charge" Protection (Payment Logic)
        // =========================================================
        
        if (payment_method === 'Card') {
            // THIS IS THE CHECKPOINT
            // If this line fails (card declined), code jumps to CATCH -> ROLLBACK.
            // Result: Customer not charged, Database wiped clean. Safe.
            
            // await stripe.charges.create({
            //     amount: Math.round(total_amount * 100), // Cents
            //     currency: 'usd',
            //     source: card_token,
            //     description: `Sale ID: ${saleId}`
            // });
            
            console.log(`Mocking Card Charge for Sale ${saleId}... Success.`);
        }

        // =========================================================
        // STEP C: Commit (Save Everything)
        // =========================================================
        await client.query('COMMIT');


        // =========================================================
        // STEP D: Return Full Receipt (For Instant Printing)
        // =========================================================
        const fullReceipt = {
            message: "Sale completed successfully",
            sale: {
                id: saleId,
                created_at: saleDate,
                total_amount: total_amount,
                payment_method: payment_method,
                items: items.map((item: any) => ({
                    product_id: item.product_id,
                    product_name: item.product_name || "Item",
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                }))
            }
        };

        res.status(201).json(fullReceipt);

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error('Transaction Failed:', err);
        res.status(500).json({ error: 'Transaction failed', details: err });
    } finally {
        client.release();
    }
};

// Get all sales (for reporting)
const getAllSales = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const result = await pool.query(`
            SELECT s.id, s.total_amount, s.payment_method, s.created_at, u.username as employee
            FROM sales s
            JOIN users u ON s.user_id = u.id
            WHERE s.tenant_id = $1
            ORDER BY s.created_at DESC
        `, [req.user.tenant_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get sale details by ID (the receipt view)
const getSaleById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;

        // Get the Header
        const saleRes = await pool.query('SELECT * FROM sales WHERE id = $1 AND tenant_id = $2', [id, req.user.tenant_id]);
        if (saleRes.rows.length === 0) return res.status(404).json({ error: 'Sale not found' });

        // Get the Items
        const itemsRes = await pool.query(`
            SELECT si.quantity, si.price_at_sale, p.name as product_name
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = $1
        `, [id]);

        // Combine them
        const fullReceipt = {
            ...saleRes.rows[0],
            items: itemsRes.rows
        };

        res.json(fullReceipt);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

export default { 
    createSale, 
    getAllSales, 
    getSaleById 
};