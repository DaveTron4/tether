import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';
import { PLAN_FEATURES, type SubscriptionTier } from '../config/plans.js';

// ==========================================
// Feature Gate Middleware
// ==========================================
// Blocks access to routes if the tenant's plan doesn't include the required module.
// Usage: router.use(requireFeature('repairs'))

export const requireFeature = (feature: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Superadmins bypass all feature checks
    if (req.user.role === 'superadmin') return next();

    try {
      const result = await pool.query(
        'SELECT subscription_tier FROM tenants WHERE id = $1',
        [req.user.tenant_id]
      );

      const tier = (result.rows[0]?.subscription_tier || 'starter') as SubscriptionTier;
      const plan = PLAN_FEATURES[tier];

      if (!plan || !plan.modules.includes(feature)) {
        return res.status(403).json({
          error: 'Feature not available',
          feature,
          current_tier: tier,
          message: `The "${feature}" feature is not included in your ${tier} plan. Please upgrade to access it.`,
        });
      }

      return next();
    } catch (err) {
      console.error('Error checking feature access:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

// ==========================================
// Limit Enforcement Middleware
// ==========================================
// Checks if the tenant has exceeded a numeric limit (employees, clients, products).
// Only blocks create (POST) requests — reads/updates are always allowed.
// Usage: router.post('/', requireLimit('maxClients', 'clients'), controller.create)

type LimitKey = 'maxEmployees' | 'maxClients' | 'maxProducts';

const LIMIT_TABLE_MAP: Record<LimitKey, string> = {
  maxEmployees: 'users',
  maxClients: 'clients',
  maxProducts: 'products',
};

export const requireLimit = (limitKey: LimitKey) => {
  const table = LIMIT_TABLE_MAP[limitKey];

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Superadmins bypass all limit checks
    if (req.user.role === 'superadmin') return next();

    try {
      const result = await pool.query(
        'SELECT subscription_tier FROM tenants WHERE id = $1',
        [req.user.tenant_id]
      );

      const tier = (result.rows[0]?.subscription_tier || 'starter') as SubscriptionTier;
      const plan = PLAN_FEATURES[tier];
      const limit = plan[limitKey];

      // -1 = unlimited
      if (limit === -1) return next();

      const countResult = await pool.query(
        `SELECT COUNT(*)::int AS count FROM ${table} WHERE tenant_id = $1`,
        [req.user.tenant_id]
      );
      const current = countResult.rows[0].count;

      if (current >= limit) {
        return res.status(403).json({
          error: 'Limit reached',
          limit_type: limitKey,
          current_count: current,
          max_allowed: limit,
          current_tier: tier,
          message: `You've reached the ${limitKey.replace('max', '').toLowerCase()} limit (${limit}) for the ${tier} plan. Upgrade to add more.`,
        });
      }

      return next();
    } catch (err) {
      console.error('Error checking limit:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
