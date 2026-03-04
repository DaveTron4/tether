import type { Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Controller functions for managing tenants

// Get all tenants (Super Admin only)
const getTenants = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new tenant (Super Admin only)
const createTenant = async (req: AuthRequest, res: Response) => {
    try {
        const {
            store_name,
            subdomain,
            logo_url,
            theme_primary_color,
            theme_secondary_color,
            contact_email,
            contact_phone,
            address_line1,
            address_city,
            address_state,
            address_zip,
            stripe_customer_id,
            stripe_subscription_id,
            subscription_status,
            subscription_tier,
            tax_rate,
            currency
        } = req.body;

        const result = await pool.query(
            `INSERT INTO tenants (
                store_name, subdomain, logo_url, theme_primary_color, theme_secondary_color,
                contact_email, contact_phone, address_line1, address_city, address_state, address_zip,
                stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier,
                tax_rate, currency
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10, $11,
                $12, $13, $14, $15,
                $16, $17
            ) RETURNING *`,
            [
                store_name,
                subdomain,
                logo_url,
                theme_primary_color,
                theme_secondary_color,
                contact_email,
                contact_phone,
                address_line1,
                address_city,
                address_state,
                address_zip,
                stripe_customer_id,
                stripe_subscription_id,
                subscription_status,
                subscription_tier,
                tax_rate,
                currency
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Could not create tenant' });
    }
};

// Update tenant details (Super Admin only)
const updateTenant = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const {
            store_name,
            subdomain,
            logo_url,
            theme_primary_color,
            theme_secondary_color,
            contact_email,
            contact_phone,
            address_line1,
            address_city,
            address_state,
            address_zip,
            stripe_customer_id,
            stripe_subscription_id,
            subscription_status,
            subscription_tier,
            tax_rate,
            currency
        } = req.body;

        const result = await pool.query(
            `UPDATE tenants SET
                store_name = COALESCE($1, store_name),
                subdomain = COALESCE($2, subdomain),
                logo_url = COALESCE($3, logo_url),
                theme_primary_color = COALESCE($4, theme_primary_color),
                theme_secondary_color = COALESCE($5, theme_secondary_color),
                contact_email = COALESCE($6, contact_email),
                contact_phone = COALESCE($7, contact_phone),
                address_line1 = COALESCE($8, address_line1),
                address_city = COALESCE($9, address_city),
                address_state = COALESCE($10, address_state),
                address_zip = COALESCE($11, address_zip),
                stripe_customer_id = COALESCE($12, stripe_customer_id),
                stripe_subscription_id = COALESCE($13, stripe_subscription_id),
                subscription_status = COALESCE($14, subscription_status),
                subscription_tier = COALESCE($15, subscription_tier),
                tax_rate = COALESCE($16, tax_rate),
                currency = COALESCE($17, currency),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $18 RETURNING *`,
            [
                store_name,
                subdomain,
                logo_url,
                theme_primary_color,
                theme_secondary_color,
                contact_email,
                contact_phone,
                address_line1,
                address_city,
                address_state,
                address_zip,
                stripe_customer_id,
                stripe_subscription_id,
                subscription_status,
                subscription_tier,
                tax_rate,
                currency,
                id
            ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Could not update tenant' });
    }
};

// Delete a tenant (Super Admin only)
const deleteTenant = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM tenants WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        res.json({ message: 'Tenant deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Could not delete tenant' });
    }
};

export default {
    getTenants,
    createTenant,
    updateTenant,
    deleteTenant
}