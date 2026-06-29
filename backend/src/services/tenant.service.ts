import { pool } from '../config/database.js';

// Tenant DB helpers: keep SQL in one place so provisioning and controllers can reuse.

export const findTenantBySubdomain = async (subdomain: string) => {
  const result = await pool.query('SELECT id, stripe_customer_id FROM tenants WHERE subdomain = $1', [subdomain]);
  return result.rows[0] ?? null;
};

export type CreateTenantPayload = {
  store_name: string;
  subdomain: string;
  admin_username: string;
  admin_email: string;
  admin_password_hash: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  tier: string;
};

export const createTenantWithAdmin = async (payload: CreateTenantPayload) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tenantResult = await client.query(
      `INSERT INTO tenants (store_name, subdomain, contact_email, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier)
       VALUES ($1, $2, $3, $4, $5, 'active', $6)
       RETURNING id`,
      [payload.store_name, payload.subdomain, payload.admin_email, payload.stripe_customer_id, payload.stripe_subscription_id, payload.tier]
    );
    const tenantId = tenantResult.rows[0].id;

    await client.query(
      `INSERT INTO users (tenant_id, username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, 'admin')`,
      [tenantId, payload.admin_username, payload.admin_email, payload.admin_password_hash, payload.admin_username]
    );

    await client.query('COMMIT');
    return tenantId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
