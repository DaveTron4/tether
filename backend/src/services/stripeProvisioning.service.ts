import { getTierFromPriceId } from '../config/plans.js';
import { retrieveSubscription } from './stripeClient.service.js';
import { findTenantBySubdomain, createTenantWithAdmin } from './tenant.service.js';
import type { Stripe } from 'stripe';


// Provision a new tenant in the database based on a completed Stripe Checkout session.
const provisionTenantFromCheckoutSession = async (session: Stripe.Checkout.Session) => {
  const { store_name, subdomain, admin_username, admin_email, admin_password_hash } = session.metadata || {};

  if (!store_name || !subdomain || !admin_username || !admin_email || !admin_password_hash) {
    console.error('Checkout session missing required metadata:', session.id, session.metadata);
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Resolve the subscription tier from the Stripe Price ID
  const stripeSubscription = await retrieveSubscription(subscriptionId);
  const priceId = stripeSubscription.items.data[0]?.price.id || '';
  const tier = getTierFromPriceId(priceId);

  // Check if tenant already exists (idempotency — webhook can fire multiple times)
  const existing = await findTenantBySubdomain(subdomain);
  if (existing) {
    console.log(`Tenant ${subdomain} already exists, skipping creation`);
    return;
  }

  // Delegate actual DB creation to tenant service
  await createTenantWithAdmin({
    store_name,
    subdomain,
    admin_username,
    admin_email,
    admin_password_hash,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    tier,
  });

  console.log(`✅ Tenant "${store_name}" (${subdomain}) created via Stripe checkout`);
};

export { provisionTenantFromCheckoutSession };