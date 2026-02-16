import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core/primitives/di';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
};
