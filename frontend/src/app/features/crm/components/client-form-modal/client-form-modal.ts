import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, X, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

// Services
import { ClientService } from '../../../../core/services/client';

// Client Interface
import { Client } from '../../../../shared/models/client.interface';


@Component({
  selector: 'app-client-form-modal',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './client-form-modal.html',
  styleUrl: './client-form-modal.css',
  providers: [
    {
      provide: LUCIDE_ICONS, 
      multi: true,
      useValue: new LucideIconProvider({ X })
    }
  ]
})
export class ClientFormModal {
  @Output() close = new EventEmitter<void>();

  clientForm: FormGroup;

  constructor(private clientService: ClientService) {
    this.clientForm = new FormGroup({
      fullName: new FormControl(''),
      phone: new FormControl(''),
      email: new FormControl(''),
      zipCode: new FormControl(''),
      notes: new FormControl(''),
      subscriptions: new FormControl([]),
      status: new FormControl('Active'),
    });
  }

  // ==========================================================
  // SUBMIT NEW CLIENT
  // ==========================================================
  onSubmit() {
    if (this.clientForm.valid) {
      const formValue = this.clientForm.value;
      const newClient: Client = {
        full_name: formValue.fullName,
        phone_number: formValue.phone,
        email: formValue.email,
        zip_code: formValue.zipCode,
        notes: formValue.notes,
        subscriptions: formValue.subscriptions,
        status: formValue.status,
        last_visit: new Date().toISOString(),
      };
      this.clientService.createClient(newClient).subscribe({
        next: (response) => {
          console.log('Client created:', response);
          alert('Client created successfully!');
          this.close.emit(); // Close modal on success
        },
        error: (error) => {
          console.error('Error creating client:', error);
          alert('Failed to create client. Please try again.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }
}
