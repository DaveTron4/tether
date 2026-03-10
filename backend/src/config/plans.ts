// ==========================================
// Plan Feature Configuration
// ==========================================
// Single source of truth for what each tier includes.
// -1 means unlimited.
import type { PlanFeatures } from '../models/planFeatures.interface.js';

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export const PLAN_FEATURES: Record<SubscriptionTier, PlanFeatures> = {
  starter: {
    maxEmployees: 3,
    maxLocations: 1,
    maxClients: 250,
    maxProducts: 500,
    modules: ['inventory', 'sales', 'clients'],
  },
  pro: {
    maxEmployees: 15,
    maxLocations: 3,
    maxClients: 2000,
    maxProducts: 5000,
    modules: ['inventory', 'sales', 'clients', 'repairs', 'subscriptions', 'branding', 'reports'],
  },
  enterprise: {
    maxEmployees: -1,
    maxLocations: -1,
    maxClients: -1,
    maxProducts: -1,
    modules: ['inventory', 'sales', 'clients', 'repairs', 'subscriptions', 'branding', 'reports', 'analytics', 'multi-location-hub', 'email-campaigns', 'api-access'],
  },
};

// ==========================================
// Stripe Price ID → Tier Mapping
// ==========================================
// Maps both monthly and yearly Stripe Price IDs to their tier.
// The billing interval doesn't affect which features you get — only the tier matters.

export const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY || '']: 'starter',
  [process.env.STRIPE_PRICE_STARTER_YEARLY || '']: 'starter',
  [process.env.STRIPE_PRICE_PRO_MONTHLY || '']: 'pro',
  [process.env.STRIPE_PRICE_PRO_YEARLY || '']: 'pro',
  [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '']: 'enterprise',
  [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '']: 'enterprise',
};

/**
 * Resolve a Stripe Price ID to a subscription tier.
 * Falls back to 'starter' if the price ID is unrecognized.
 */
export const getTierFromPriceId = (priceId: string): SubscriptionTier => {
  return PRICE_TO_TIER[priceId] || 'starter';
};
