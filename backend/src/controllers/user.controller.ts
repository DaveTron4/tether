import type { Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Get all users for the current tenant (admin/superadmin only)
const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let result;

    if (req.user.role === 'superadmin') {
      // Superadmins can see all users across all tenants
      result = await pool.query(
        `SELECT u.id, u.tenant_id, u.username, u.email, u.role, u.full_name, u.created_at, t.name AS tenant_name
         FROM users u
         JOIN tenants t ON u.tenant_id = t.id
         ORDER BY t.name, u.role, u.full_name`
      );
    } else {
      // Admins see only their own tenant's users
      result = await pool.query(
        `SELECT id, tenant_id, username, email, role, full_name, created_at
         FROM users
         WHERE tenant_id = $1
         ORDER BY role, full_name`,
        [req.user.tenant_id]
      );
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a single user by ID
const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await pool.query(
      'SELECT id, tenant_id, username, email, role, full_name, created_at FROM users WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default { getAllUsers, getUserById };
