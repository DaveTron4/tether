import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Client } from '../../shared/models/client.interface';
import { ClientSummary } from '../../shared/models/clientSummary.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  // ==========================================================
  // GET ALL CLIENTS
  // ==========================================================
  getClients() {
    const token = localStorage.getItem('tether_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<Client[]>(this.apiUrl, { headers });
  }

  // ==========================================================
  // GET CLIENT BY ID
  // ==========================================================
  getClientById(id: number) {
    const token = localStorage.getItem('tether_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<Client>(`${this.apiUrl}/${id}`, { headers });
  }

  // ==========================================================
  // CREATE NEW CLIENT
  // ==========================================================
  createClient(client: Client) {
    const token = localStorage.getItem('tether_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<Client>(this.apiUrl, client, { headers });
  }

  // ==========================================================
  // UPDATE EXISTING CLIENT
  // ==========================================================
  updateClient(id: number, client: Client) {
    const token = localStorage.getItem('tether_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client, { headers });
  }

  // ==========================================================
  // GET CLIENT SUMMARY (Lifetime Value & Balance Due)
  // ==========================================================
  getClientSummary(id: number) {
    const token = localStorage.getItem('tether_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<ClientSummary>(`${this.apiUrl}/${id}/summary`, { headers });
  }
}
