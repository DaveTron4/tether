import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing-page',
  imports: [RouterLink],
  templateUrl: './pricing-page.html',
  styleUrl: './pricing-page.css',
})
export class PricingPage {
  yearlyToggle = false;

  plans = [
    {
      name: 'Starter',
      monthlyPrice: 19,
      yearlyPrice: 99,
      monthlyPriceId: 'price_1T8v9R2FezLz3MJhGricPnUc', // Replace with real Stripe price IDs
      yearlyPriceId: 'price_1T8u9H2FezLz3MJhmTHyqdll',
      features: [
        'Up to 3 users',
        'Up to 100 clients',
        'CRM & Client Management',
        'Repair Tracking',
        'Point of Sale',
      ],
      highlighted: false,
    },
    {
      name: 'Pro',
      monthlyPrice: 59,
      yearlyPrice: 590,
      monthlyPriceId: 'price_1T8v4a2FezLz3MJhePAUu65C',
      yearlyPriceId: 'price_1T8v5Y2FezLz3MJhxNUdkcxh',
      features: [
        'Up to 10 users',
        'Up to 500 clients',
        'Everything in Starter',
        'Inventory Management',
        'Subscription Tracking',
        'Custom Logo & Colors',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: 99,
      yearlyPrice: 990,
      monthlyPriceId: 'price_1T8v682FezLz3MJhWQnkj7gt',
      yearlyPriceId: 'price_1T8v6r2FezLz3MJh9jZNHdbD',
      features: [
        'Unlimited users',
        'Unlimited clients',
        'Everything in Pro',
        'Full White-Label Branding',
        'Priority Support',
        'API Access',
      ],
      highlighted: false,
    },
  ];

  toggleBilling() {
    this.yearlyToggle = !this.yearlyToggle;
  }

  getPrice(plan: typeof this.plans[0]): number {
    return this.yearlyToggle ? plan.yearlyPrice : plan.monthlyPrice;
  }

  getPriceId(plan: typeof this.plans[0]): string {
    return this.yearlyToggle ? plan.yearlyPriceId : plan.monthlyPriceId;
  }

  getBillingLabel(): string {
    return this.yearlyToggle ? '/year' : '/month';
  }
}
