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
// Map your Stripe Price IDs to subscription tiers.
// Set these in .env and they'll be loaded here.

export const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_PRO || '']: 'pro',
  [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
};

/**
 * Resolve a Stripe Price ID to a subscription tier.
 * Falls back to 'starter' if the price ID is unrecognized.
 */
export const getTierFromPriceId = (priceId: string): SubscriptionTier => {
  return PRICE_TO_TIER[priceId] || 'starter';
};
