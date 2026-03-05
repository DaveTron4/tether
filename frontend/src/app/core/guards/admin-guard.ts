import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && (user.role === 'admin' || user.role === 'superadmin')) {
    return true;
  }

  router.navigate(['/inventory']);
  return false;
};
