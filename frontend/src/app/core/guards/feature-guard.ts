import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { PlanService } from '../services/plan';

/**
 * Route guard that checks if the tenant's plan includes a specific module.
 * Usage in routes: canActivate: [featureGuard('repairs')]
 */
export const featureGuard = (feature: string): CanActivateFn => {
  return () => {
    const planService = inject(PlanService);
    const router = inject(Router);

    if (planService.canAccess(feature)) {
      return true;
    }

    // Redirect to an upgrade page or back to inventory
    router.navigate(['/inventory']);
    return false;
  };
};
