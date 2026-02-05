import type { Request, Response } from 'express';
import { pool } from '../config/database.js';

// Controller functions for managing clients
const getAllClients = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a single client by ID
const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching client:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new client
const createClient = async (req: Request, res: Response) => {
  try {
    const {full_name, phone_number, zip_code, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO clients (full_name, phone_number, zip_code, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [full_name, phone_number, zip_code, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update an existing client
const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, zip_code, notes } = req.body;
    
    const result = await pool.query(
      'UPDATE clients SET full_name = $1, phone_number = $2, zip_code = $3, notes = $4 WHERE id = $5 RETURNING *',
      [full_name, phone_number, zip_code, notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a client
const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
