import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateDeviceInput,
  DeleteDeviceResponse,
  Device,
  UpdateDeviceInput,
} from '../../shared/models/device.interface';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/devices`;

  getDevices() {
    return this.http.get<Device[]>(this.apiUrl, { headers: this.authHeaders() });
  }

  getDeviceById(id: number) {
    return this.http.get<Device>(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  getDevicesByClientId(clientId: number) {
    return this.http.get<Device[]>(`${this.apiUrl}/client/${clientId}`, {
      headers: this.authHeaders(),
    });
  }

  createDevice(device: CreateDeviceInput) {
    return this.http.post<Device>(this.apiUrl, device, {
      headers: this.authHeaders(),
    });
  }

  updateDevice(id: number, device: UpdateDeviceInput) {
    return this.http.put<Device>(`${this.apiUrl}/${id}`, device, {
      headers: this.authHeaders(),
    });
  }

  deleteDevice(id: number) {
    return this.http.delete<DeleteDeviceResponse>(`${this.apiUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders() {
    const token = localStorage.getItem('tether_token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
  }
}
