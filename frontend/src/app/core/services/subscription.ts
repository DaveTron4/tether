import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription } from '../../shared/models/subscription.interface';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  createSubscription(subscription: Subscription) {
    const token = localStorage.getItem('tether_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<Subscription>(this.apiUrl, subscription, { headers });
  }
}
