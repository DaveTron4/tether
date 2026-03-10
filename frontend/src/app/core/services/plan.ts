import { Injectable, inject, signal, computed } from '@angular/core';
import { StripeService } from './stripe';
import { PlanFeatures } from '../../shared/models/planFeatures.interface';


@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private stripeService = inject(StripeService);

  // Reactive state
  private _tier = signal<string>('starter');
  private _features = signal<PlanFeatures | null>(null);
  private _loaded = signal(false);

  // Public computed values
  tier = this._tier.asReadonly();
  features = this._features.asReadonly();
  loaded = this._loaded.asReadonly();

  modules = computed(() => this._features()?.modules ?? []);

  /**
   * Load the plan features from the API.
   * Call this once after login (e.g., in MainLayout or app init).
   */
  loadPlan() {
    this.stripeService.getSubscriptionStatus().subscribe({
      next: (res) => {
        this._tier.set(res.subscription_tier);
        this._features.set(res.features);
        this._loaded.set(true);
      },
      error: (err) => {
        console.error('Failed to load plan features:', err);
        this._loaded.set(true);
      },
    });
  }

  /**
   * Check if the current plan includes a specific module.
   */
  canAccess(module: string): boolean {
    return this.modules().includes(module);
  }

  /**
   * Clear plan state (call on logout).
   */
  clear() {
    this._tier.set('starter');
    this._features.set(null);
    this._loaded.set(false);
  }
}
