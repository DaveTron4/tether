import { stripe } from '../config/stripe.js';
import type Stripe from 'stripe';

export const retrieveSession = async (id: string) => {
  return stripe.checkout.sessions.retrieve(id);
};

export const retrieveSubscription = async (id: string) => {
  return stripe.subscriptions.retrieve(id);
};

export const constructEvent = (rawBody: any, sig: string, secret: string) => {
  return stripe.webhooks.constructEvent(rawBody, sig, secret);
};
