import type { Request, Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { stripe } from '../config/stripe.js';
import { pool } from '../config/database.js';
import { getTierFromPriceId, PLAN_FEATURES, type SubscriptionTier } from '../config/plans.js';
import bcrypt from 'bcrypt';
import type Stripe from 'stripe';

// ==========================================
// 1. CREATE CHECKOUT SESSION (Public)
// ==========================================
// New tenant selects a plan → we create a Stripe Checkout Session
// Tenant + admin user are created AFTER payment via webhook
const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const { store_name, subdomain, admin_username, admin_email, admin_password, price_id } = req.body || {};

        // Validate required fields
        if (!store_name || !subdomain || !admin_username || !admin_email || !admin_password || !price_id) {
            return res.status(400).json({ error: 'Missing required fields: store_name, subdomain, admin_username, admin_email, admin_password, price_id' });
        }

        // Validate subdomain format (lowercase alphanumeric + hyphens)
        if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain) || subdomain.length < 3) {
            return res.status(400).json({ error: 'Subdomain must be at least 3 characters, lowercase alphanumeric with hyphens only' });
        }

        // Check if subdomain is already taken
        const existing = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Subdomain is already taken' });
        }

        // Hash the password before storing in metadata
        // We store the hash (not plaintext) so Stripe metadata never has raw passwords
        const passwordHash = await bcrypt.hash(admin_password, 10);

        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: price_id, quantity: 1 }],
            success_url: `${FRONTEND_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/signup/cancel`,
            metadata: {
                store_name,
                subdomain,
                admin_username,
                admin_email,
                admin_password_hash: passwordHash,
            },
        });

        return res.json({ checkout_url: session.url });
    } catch (err) {
        console.error('Error creating checkout session:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ==========================================
// 2. STRIPE WEBHOOK (Public, raw body)
// ==========================================
const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'invoice.paid':
                await handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            default:
                // Unhandled event type — ignore
                break;
        }

        return res.json({ received: true });
    } catch (err) {
        console.error('Error processing webhook event:', err);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// ==========================================
// Webhook Handlers
// ==========================================

// checkout.session.completed → Create tenant + admin user
const handleCheckoutCompleted = async (sessionFromEvent: Stripe.Checkout.Session) => {
    // Always retrieve the full session from Stripe to ensure metadata is included
    const session = await stripe.checkout.sessions.retrieve(sessionFromEvent.id);

    const { store_name, subdomain, admin_username, admin_email, admin_password_hash } = session.metadata || {};

    if (!store_name || !subdomain || !admin_username || !admin_email || !admin_password_hash) {
        console.error('Checkout session missing required metadata:', session.id, session.metadata);
        return;
    }

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Resolve the subscription tier from the Stripe Price ID
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = stripeSubscription.items.data[0]?.price.id || '';
    const tier = getTierFromPriceId(priceId);

    // Check if tenant already exists (idempotency — webhook can fire multiple times)
    const existing = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (existing.rows.length > 0) {
        console.log(`Tenant ${subdomain} already exists, skipping creation`);
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create tenant with the correct subscription tier
        const tenantResult = await client.query(
            `INSERT INTO tenants (store_name, subdomain, contact_email, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier)
            VALUES ($1, $2, $3, $4, $5, 'active', $6)
            RETURNING id`,
            [store_name, subdomain, admin_email, customerId, subscriptionId, tier]
        );
        const tenantId = tenantResult.rows[0].id;

        // Create admin user
        await client.query(
            `INSERT INTO users (tenant_id, username, email, password_hash, full_name, role)
            VALUES ($1, $2, $3, $4, $5, 'admin')`,
            [tenantId, admin_username, admin_email, admin_password_hash, admin_username]
        );

        await client.query('COMMIT');
        console.log(`✅ Tenant "${store_name}" (${subdomain}) created via Stripe checkout`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating tenant from checkout:', err);
        throw err;
    } finally {
        client.release();
    }
};

// invoice.paid → Activate subscription
const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
    const customerId = invoice.customer as string;
    if (!customerId) return;

    await pool.query(
        `UPDATE tenants SET subscription_status = 'active', updated_at = NOW() WHERE stripe_customer_id = $1`,
        [customerId]
    );
    console.log(`✅ Tenant subscription activated for customer ${customerId}`);
};

// invoice.payment_failed → Mark as past_due
const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
    const customerId = invoice.customer as string;
    if (!customerId) return;

    await pool.query(
        `UPDATE tenants SET subscription_status = 'past_due', updated_at = NOW() WHERE stripe_customer_id = $1`,
        [customerId]
    );
    console.log(`⚠️ Payment failed for customer ${customerId}`);
};

// customer.subscription.updated → Sync status AND tier (handles upgrades/downgrades)
const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
    const customerId = subscription.customer as string;
    if (!customerId) return;

    // Map Stripe status to our status
    const statusMap: Record<string, string> = {
        active: 'active',
        past_due: 'past_due',
        canceled: 'canceled',
        unpaid: 'past_due',
        trialing: 'trialing',
        incomplete: 'past_due',
        incomplete_expired: 'canceled',
        paused: 'past_due',
    };

    const status = statusMap[subscription.status] || 'past_due';

    // Resolve the tier from the current price
    const priceId = subscription.items.data[0]?.price.id || '';
    const tier = getTierFromPriceId(priceId);

    await pool.query(
        `UPDATE tenants SET subscription_status = $1, subscription_tier = $2, updated_at = NOW() WHERE stripe_customer_id = $3`,
        [status, tier, customerId]
    );
    console.log(`🔄 Subscription updated for customer ${customerId}: status=${status}, tier=${tier}`);
};

// customer.subscription.deleted → Cancel
const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
    const customerId = subscription.customer as string;
    if (!customerId) return;

    await pool.query(
        `UPDATE tenants SET subscription_status = 'canceled', updated_at = NOW() WHERE stripe_customer_id = $1`,
        [customerId]
    );
    console.log(`❌ Subscription canceled for customer ${customerId}`);
};

// ==========================================
// 3. BILLING PORTAL (Authenticated tenants)
// ==========================================
// Redirects tenant admin to Stripe's billing portal to manage subscription
const createBillingPortalSession = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

            // Only admins can manage billing
            if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can manage billing' });
            }

            // Get tenant's Stripe customer ID
            const tenantResult = await pool.query(
            'SELECT stripe_customer_id FROM tenants WHERE id = $1',
            [req.user.tenant_id]
            );

            if (tenantResult.rows.length === 0 || !tenantResult.rows[0].stripe_customer_id) {
            return res.status(404).json({ error: 'No billing account found for this tenant' });
            }

            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

            const portalSession = await stripe.billingPortal.sessions.create({
            customer: tenantResult.rows[0].stripe_customer_id,
            return_url: `${FRONTEND_URL}/settings/billing`,
            });

            return res.json({ portal_url: portalSession.url });
        } catch (err) {
            console.error('Error creating billing portal session:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
};

// ==========================================
// 4. GET SUBSCRIPTION STATUS (Authenticated)
// ==========================================
const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const result = await pool.query(
        'SELECT subscription_status, subscription_tier FROM tenants WHERE id = $1',
        [req.user.tenant_id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tenant not found' });
        }

        const { subscription_status, subscription_tier } = result.rows[0];
        const tier = (subscription_tier || 'starter') as SubscriptionTier;
        const features = PLAN_FEATURES[tier];

        return res.json({ subscription_status, subscription_tier: tier, features });
    } catch (err) {
        console.error('Error fetching subscription status:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { createCheckoutSession, handleWebhook, createBillingPortalSession, getSubscriptionStatus };
