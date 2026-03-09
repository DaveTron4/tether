import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Middleware: Block access if tenant subscription is not active
// Allows: 'active', 'trialing'
// Blocks: 'past_due', 'canceled', 'unpaid'
export const requireActiveSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  // Superadmins bypass subscription checks (system tenant)
  if (req.user.role === 'superadmin') return next();

  try {
    const result = await pool.query(
      'SELECT subscription_status FROM tenants WHERE id = $1',
      [req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const { subscription_status } = result.rows[0];

    if (subscription_status === 'active' || subscription_status === 'trialing') {
      return next();
    }

    // Subscription is not active — full block
    return res.status(403).json({
      error: 'Subscription inactive',
      subscription_status,
      message: 'Your subscription is not active. Please update your payment to continue.',
      redirect: '/billing',
    });
  } catch (err) {
    console.error('Error checking subscription status:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
