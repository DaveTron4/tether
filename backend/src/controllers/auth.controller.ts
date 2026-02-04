import type { Request, Response } from 'express';
import { pool } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Controller functions for authentication
// User login
const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }  

        const tokenPayload = { id: user.id, username: user.username, role: user.role };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ 
            message: 'Login successful', 
            token: token,
            user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role }
        });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// User registration
const register = async (req: Request, res: Response) => {
    try {
        const { username, password, fullName, role } = req.body;

        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultRole = 'employee';
        
        const result = await pool.query(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
            [username, hashedPassword, fullName, defaultRole]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default {
    login,
    register
};