import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaymentHistory as PaymentHistoryInterface } from '../../shared/models/paymentHistory.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentHistoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/paymentHistory`;

  getClientPaymentHistory(subscriptionId: number) {
    const token = localStorage.getItem('tether_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<PaymentHistoryInterface[]>(`${this.apiUrl}?subscription_id=${subscriptionId}`, { headers });
  }
}
