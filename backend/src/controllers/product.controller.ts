import type { Request, Response } from 'express';
import { pool } from '../config/database.js';

// Controller functions for managing products

// Get all products
const getAllProducts = async (req: Request, res: Response) => {
  try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a single product by ID
const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create new product
const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, barcode, category, is_generic, price, cost, stock, stock_quantity, min_stock_level, properties } = req.body;

        // Validate required fields
        if (!name || !barcode || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate bar code uniqueness
        const barcodeCheck = await pool.query('SELECT * FROM products WHERE barcode = $1', [barcode]);
        if (barcodeCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Barcode already exists' });
        }

        const result = await pool.query(
            'INSERT INTO products (name, barcode, category, is_generic, price, cost, stock_quantity, min_stock_level, properties) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, barcode, category, is_generic, price, cost || 0, stock_quantity ?? stock ?? 0, min_stock_level || 5, properties || {}]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete product by ID
const deleteProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update product by ID
const updateProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, barcode, category, is_generic, price, cost, stock, stock_quantity, min_stock_level, properties } = req.body;
        const result = await pool.query(
            `UPDATE products 
             SET name = COALESCE($1, name),
                    barcode = COALESCE($2, barcode),
                    category = COALESCE($3, category),
                    is_generic = COALESCE($4, is_generic),
                    price = COALESCE($5, price),
                    cost = COALESCE($6, cost),
                    stock_quantity = COALESCE($7, stock_quantity),
                    min_stock_level = COALESCE($8, min_stock_level),
                    properties = COALESCE($9, properties)
                WHERE id = $10
                RETURNING *`,
            [name, barcode, category, is_generic, price, cost, stock_quantity ?? stock, min_stock_level, properties, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default {
    getAllProducts,
    getProductById,
    createProduct,
    deleteProductById,
    updateProductById
};