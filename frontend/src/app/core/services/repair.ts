import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RepairTicket } from '../../shared/models/repair.interface';

@Injectable({ providedIn: 'root' })
export class RepairService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/repairs`;

  getRepairs() {
    return this.http.get<RepairTicket[]>(this.apiUrl, { headers: this.authHeaders() });
  }

  getRepairsByClientId(clientId: number) {
    return this.http.get<RepairTicket[]>(`${this.apiUrl}/by-client?client_id=${clientId}`, {
      headers: this.authHeaders(),
    });
  }

  createRepair(repair: Omit<RepairTicket, 'id' | 'tenant_id' | 'client_name' | 'device_model' | 'created_at' | 'completed_at'>) {
    return this.http.post<RepairTicket>(this.apiUrl, repair, { headers: this.authHeaders() });
  }

  updateRepair(id: number, repair: Partial<RepairTicket>) {
    return this.http.put<RepairTicket>(`${this.apiUrl}/${id}`, repair, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders() {
    const token = localStorage.getItem('tether_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }
}
