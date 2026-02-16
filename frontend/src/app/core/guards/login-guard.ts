import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';
import { inject } from '@angular/core/primitives/di';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/inventory']);
    return false;
  }
  return true;
};