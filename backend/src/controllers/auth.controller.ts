import type { Request, Response } from 'express';
import { pool } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../models/authRequest.interface.js';

// Controller functions for authentication

// User login
const login = async (req: Request, res: Response) => {
    try {
        const { username, password, subdomain } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password in request body' });
        }

        let result;

        if (subdomain) {
            // Multi-tenant login: scope by subdomain
            result = await pool.query(
                `SELECT u.*, t.subdomain 
                 FROM users u 
                 JOIN tenants t ON u.tenant_id = t.id 
                 WHERE u.username = $1 AND t.subdomain = $2`,
                [username, subdomain]
            );
        } else {
            // Localhost / single-tenant fallback: find by username only
            // If multiple users share the same username across tenants, this picks the first match
            result = await pool.query(
                `SELECT u.*, t.subdomain 
                 FROM users u 
                 JOIN tenants t ON u.tenant_id = t.id 
                 WHERE u.username = $1 
                 LIMIT 1`,
                [username]
            );
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }  

        const tokenPayload = { id: user.id, tenant_id: user.tenant_id, username: user.username, role: user.role };
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) return res.status(500).json({ error: 'Server misconfigured: JWT secret missing' });
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
        return res.json({ 
            message: 'Login successful', 
            token: token,
            user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role, tenantId: user.tenant_id }
        });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// User registration
const register = async (req: AuthRequest, res: Response) => {
    try {
        const { username, password, fullName, tenant_id, role } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password in request body' });
        }

        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        // Determine target tenant and role based on who is calling
        let targetTenantId: string;
        let targetRole: string;

        if (req.user.role === 'superadmin') {
            // Superadmins MUST specify a tenant_id and can set any role
            if (!tenant_id) {
                return res.status(400).json({ error: 'Superadmin must specify a tenant_id' });
            }
            targetTenantId = tenant_id;
            targetRole = role === 'admin' ? 'admin' : 'employee';
        } else {
            // Admins are locked to their own tenant and can only create employees
            targetTenantId = req.user.tenant_id;
            targetRole = 'employee';
        }

        // Check username uniqueness within the target tenant
        const userCheck = await pool.query(
            'SELECT id FROM users WHERE username = $1 AND tenant_id = $2',
            [username, targetTenantId]
        );
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (tenant_id, username, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, tenant_id',
            [targetTenantId, username, hashedPassword, fullName, targetRole]
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