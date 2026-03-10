import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';

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
      monthlyPriceId: environment.stripePrices.starterMonthly,
      yearlyPriceId: environment.stripePrices.starterYearly,
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
      monthlyPriceId: environment.stripePrices.proMonthly,
      yearlyPriceId: environment.stripePrices.proYearly,
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
      monthlyPriceId: environment.stripePrices.enterpriseMonthly,
      yearlyPriceId: environment.stripePrices.enterpriseYearly,
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
