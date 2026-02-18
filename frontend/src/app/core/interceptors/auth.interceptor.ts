import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get token from localStorage
  const token = localStorage.getItem('tether_token');
  
  // Clone request and add auth header if token exists
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 (unauthorized/expired token), log out the user
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
