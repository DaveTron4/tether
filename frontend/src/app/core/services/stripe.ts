import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stripe`;

  /**
   * Creates a Stripe Checkout session for new tenant signup.
   * Redirects the user to Stripe's hosted checkout page.
   */
  createCheckoutSession(data: {
    store_name: string;
    subdomain: string;
    admin_username: string;
    admin_email: string;
    admin_password: string;
    price_id: string;
  }) {
    return this.http.post<{ checkout_url: string }>(`${this.apiUrl}/checkout`, data);
  }

  /**
   * Gets the current subscription status for the authenticated tenant.
   */
  getSubscriptionStatus() {
    return this.http.get<{ subscription_status: string; subscription_tier: string }>(`${this.apiUrl}/subscription-status`);
  }

  /**
   * Creates a Stripe Billing Portal session so admins can manage their subscription.
   */
  createBillingPortalSession() {
    return this.http.post<{ portal_url: string }>(`${this.apiUrl}/billing-portal`, {});
  }
}
