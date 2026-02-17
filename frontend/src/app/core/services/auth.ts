import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../../shared/models/authResponse.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<AuthResponse['user'] | null>(this.getUserFromStorage());

  // ==========================================================
  // LOGIN METHOD
  // ==========================================================
  login(credentials: { email?: string; username?: string; password: string }) {
    const payload = {
      email: credentials.email,
      username: credentials.username,
      password: credentials.password,
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem('tether_token', response.token);
        
        localStorage.setItem('tether_user', JSON.stringify(response.user));

        this.currentUser.set(response.user);

        const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/inventory';
        this.router.navigateByUrl(returnUrl);
      })
    );
  }

  // ==========================================================
  // LOGOUT METHOD
  // ==========================================================
  logout() {

    localStorage.removeItem('tether_token');
    localStorage.removeItem('tether_user');

    this.currentUser.set(null);

    this.router.navigate(['/login']);
  }

  // ==========================================================
  // HELPER: AM I LOGGED IN?
  // ==========================================================
  isLoggedIn(): boolean {

    return !!localStorage.getItem('tether_token');
  }

  // ==========================================================
  // Register Method
  // ==========================================================
  register(data: { email: string; username: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        localStorage.setItem('tether_token', response.token);
        localStorage.setItem('tether_user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
      })
    );
  }
  // ==========================================================

  // =========================================================
  // HELPER: Get User from Local Storage
  // ==========================================================
  private getUserFromStorage() {
    const user = localStorage.getItem('tether_user');
    return user ? JSON.parse(user) : null;
  }

  // =========================================================
  // HELPER: Get Authenticated User
  // =========================================================
  getAuthenticatedUser() {
    return this.currentUser();
  }
}