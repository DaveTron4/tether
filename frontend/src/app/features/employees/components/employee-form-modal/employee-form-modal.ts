import { Component, Output, EventEmitter, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, X, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

import { EmployeeService } from '../../../../core/services/employee';
import { environment } from '../../../../../environments/environment';

interface Tenant {
  id: string;
  store_name: string;
  subdomain: string;
}

@Component({
  selector: 'app-employee-form-modal',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './employee-form-modal.html',
  styleUrl: './employee-form-modal.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ X })
    }
  ]
})
export class EmployeeFormModal implements OnInit {
  @Input() isSuperAdmin = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private employeeService = inject(EmployeeService);
  private http = inject(HttpClient);

  tenants = signal<Tenant[]>([]);
  errorMessage = signal('');

  employeeForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    tenant_id: new FormControl(''),
    role: new FormControl('employee'),
  });

  ngOnInit() {
    if (this.isSuperAdmin) {
      this.employeeForm.controls.tenant_id.setValidators(Validators.required);
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
    if (!this.employeeForm.valid) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.errorMessage.set('');
    const formVal = this.employeeForm.value;

    const payload: any = {
      username: formVal.username,
      password: formVal.password,
      fullName: formVal.fullName,
    };

    if (this.isSuperAdmin) {
      payload.tenant_id = formVal.tenant_id;
      payload.role = formVal.role;
    }

    this.employeeService.createEmployee(payload).subscribe({
      next: () => {
        this.created.emit();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Failed to create employee. Please try again.');
      }
    });
  }
}
