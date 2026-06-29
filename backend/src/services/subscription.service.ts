import { pool } from '../config/database.js';
import { getTierFromPriceId } from '../config/plans.js';
import type Stripe from 'stripe';

export const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  await pool.query(
    `UPDATE tenants SET subscription_status = 'active', updated_at = NOW() WHERE stripe_customer_id = $1`,
    [customerId]
  );
};

export const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  await pool.query(
    `UPDATE tenants SET subscription_status = 'past_due', updated_at = NOW() WHERE stripe_customer_id = $1`,
    [customerId]
  );
};

export const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  const customerId = subscription.customer as string;
  if (!customerId) return;

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
  const priceId = subscription.items.data[0]?.price.id || '';
  const tier = getTierFromPriceId(priceId);

  await pool.query(
    `UPDATE tenants SET subscription_status = $1, subscription_tier = $2, updated_at = NOW() WHERE stripe_customer_id = $3`,
    [status, tier, customerId]
  );
};

export const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  const customerId = subscription.customer as string;
  if (!customerId) return;

  await pool.query(
    `UPDATE tenants SET subscription_status = 'canceled', updated_at = NOW() WHERE stripe_customer_id = $1`,
    [customerId]
  );
};
