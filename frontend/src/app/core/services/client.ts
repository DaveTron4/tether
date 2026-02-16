import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Client } from '../../shared/models/client.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  getClients() {
    const x = this.http.get<Client[]>(this.apiUrl);
    console.log('Fetching clients from API...', x);
    return x;
  }
}
