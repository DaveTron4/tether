import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { type CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { PlanService } from '../services/plan';

/**
 * Route guard that checks if the tenant's plan includes a specific module.
 * Usage in routes: canActivate: [featureGuard('repairs')]
 */
export const featureGuard = (feature: string): CanActivateFn => {
  return () => {
    const planService = inject(PlanService);
    const router = inject(Router);

    if (planService.loaded()) {
      return planService.canAccess(feature);
    }

    return toObservable(planService.loaded).pipe(
      filter((loaded) => loaded),
      take(1),
      map(() => {
        if (planService.canAccess(feature)) {
          return true;
        }

        return router.createUrlTree(['/inventory']);
      })
    );
  };
};
