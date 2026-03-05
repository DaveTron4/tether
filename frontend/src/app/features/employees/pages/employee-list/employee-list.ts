import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Search, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

// Components
import { EmployeeTable } from '../../components/employee-table/employee-table';
import { EmployeeFormModal } from '../../components/employee-form-modal/employee-form-modal';

// Interfaces
import { User } from '../../../../shared/models/user.interface';

// Services
import { EmployeeService } from '../../../../core/services/employee';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, LucideAngularModule, EmployeeTable, EmployeeFormModal],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Plus, Search })
    }
  ]
})
export class EmployeeList implements OnInit {

  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  private rawEmployees = signal<User[]>([]);

  protected searchQuery = signal<string>('');

  protected isSuperAdmin = computed(() => {
    return this.authService.currentUser()?.role === 'superadmin';
  });

  protected filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const all = this.rawEmployees();

    if (!query) return all;

    return all.filter(emp =>
      emp.full_name?.toLowerCase().includes(query) ||
      emp.username?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.role?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe((data) => {
      this.rawEmployees.set(data);
    });
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // Modal state
  protected showCreateModal = signal<boolean>(false);

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  onEmployeeCreated() {
    this.showCreateModal.set(false);
    this.loadEmployees();
  }
}
