import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces
import { User } from '../../../../shared/models/user.interface';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-table.html',
  styleUrl: './employee-table.css',
})
export class EmployeeTable {
  @Input() employees: User[] = [];
  @Input() showTenant: boolean = false;
}
