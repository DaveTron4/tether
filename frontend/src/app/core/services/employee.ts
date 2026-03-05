import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  private get headers() {
    const token = localStorage.getItem('tether_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  // ==========================================================
  // GET ALL EMPLOYEES
  // ==========================================================
  getEmployees() {
    return this.http.get<User[]>(this.apiUrl, { headers: this.headers });
  }

  // ==========================================================
  // GET EMPLOYEE BY ID
  // ==========================================================
  getEmployeeById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  // ==========================================================
  // CREATE EMPLOYEE (uses /auth/register)
  // ==========================================================
  createEmployee(data: { username: string; password: string; fullName?: string; tenant_id?: string; role?: string }) {
    const authUrl = `${environment.apiUrl}/auth/register`;
    return this.http.post<User>(authUrl, data, { headers: this.headers });
  }
}
