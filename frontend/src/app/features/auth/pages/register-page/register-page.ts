import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../../../core/services/auth';
import { environment } from '../../../../../environments/environment';

interface Tenant {
  id: string;
  store_name: string;
  subdomain: string;
}

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  isSuperAdmin = signal(false);
  tenants = signal<Tenant[]>([]);
  successMessage = signal('');
  errorMessage = signal('');

  registerForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    tenant_id: new FormControl(''),
    role: new FormControl('employee'),
  });

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user?.role === 'superadmin') {
      this.isSuperAdmin.set(true);
      this.registerForm.controls.tenant_id.setValidators(Validators.required);
      this.loadTenants();
    }
  }

  private loadTenants() {
    const superAdminSecret = localStorage.getItem('tether_super_admin_secret') || '';
    this.http.get<Tenant[]>(`${environment.apiUrl}/tenants`, {
      headers: { 'x-super-admin-secret': superAdminSecret }
    }).subscribe({
      next: (tenants) => this.tenants.set(tenants.filter(t => t.subdomain !== 'system')),
      error: () => this.errorMessage.set('Failed to load tenants')
    });
  }

  onSubmit() {
    if (!this.registerForm.valid) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    const formVal = this.registerForm.value;

    const payload: any = {
      username: formVal.username,
      password: formVal.password,
      fullName: formVal.fullName,
    };

    // Superadmin sends tenant_id and role; admin doesn't
    if (this.isSuperAdmin()) {
      payload.tenant_id = formVal.tenant_id;
      payload.role = formVal.role;
    }

    this.authService.register(payload).subscribe({
      next: (created) => {
        const roleName = this.isSuperAdmin() ? (formVal.role || 'employee') : 'employee';
        this.successMessage.set(`${roleName.charAt(0).toUpperCase() + roleName.slice(1)} "${created.username}" created successfully.`);
        this.registerForm.reset({ role: 'employee', tenant_id: '' });
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Registration failed. Please try again.');
      }
    });
  }
}
