import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../../shared/models/authResponse.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root' // Makes this available everywhere
})
export class AuthService {
  
  // Dependencies (Modern syntax)
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // API URL (In real life, use environment.apiUrl)
  private apiUrl = `${environment.apiUrl}/auth`;

  // 2. STATE: A Signal to hold the current user
  // Other components can read this without subscribing!
  currentUser = signal<AuthResponse['user'] | null>(this.getUserFromStorage());

  // ==========================================================
  // 3. THE LOGIN METHOD (The "Yes/No" + Storage)
  // ==========================================================
  login(credentials: { email?: string; username?: string; password: string }) {
    // Backend expects { username, password }. Support callers that pass `email`.
    const payload = {
      username: credentials.username ?? credentials.email,
      password: credentials.password,
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        // A. Backend said YES and gave us a token.
        // B. Store the token in the browser's secret pocket.
        localStorage.setItem('tether_token', response.token);
        
        // C. Store the user data too (so we don't have to ask for it again).
        localStorage.setItem('tether_user', JSON.stringify(response.user));

        // D. Update the Signal so the UI updates instantly.
        this.currentUser.set(response.user);
      })
    );
  }

  // ==========================================================
  // 4. THE LOGOUT METHOD
  // ==========================================================
  logout() {
    // A. Rip up the ID badge
    localStorage.removeItem('tether_token');
    localStorage.removeItem('tether_user');
    
    // B. Clear the state
    this.currentUser.set(null);
    
    // C. Kick them out
    this.router.navigate(['/login']);
  }

  // ==========================================================
  // 5. HELPER: AM I LOGGED IN?
  // ==========================================================
  isLoggedIn(): boolean {
    // Simply checks if we have a token in the pocket.
    // (Bonus: You can add logic here to check if it's expired)
    return !!localStorage.getItem('tether_token');
  }

  // Private helper to restore state on page refresh
  private getUserFromStorage() {
    const user = localStorage.getItem('tether_user');
    return user ? JSON.parse(user) : null;
  }
}