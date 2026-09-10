import { Component, Input, Output, EventEmitter, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

// Services
import { ClientService } from '../../../../core/services/client';
import { SubscriptionService } from '../../../../core/services/subscription';

// Interfaces
import { Client } from '../../../../shared/models/client.interface';
import { Subscription } from '../../../../shared/models/subscription.interface';

@Component({
  selector: 'app-subscription-form-modal',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './subscription-form-modal.html',
  styleUrl: './subscription-form-modal.css',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ X })
    }
  ]
})
export class SubscriptionFormModal implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() clientId?: number;
  @Input() subscription?: Subscription;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<Subscription>();

  private clientService = inject(ClientService);
  private subscriptionService = inject(SubscriptionService);

  subscriptionForm!: FormGroup;
  clients: Client[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.initializeForm();
    this.loadClients();
  }

  initializeForm() {
    if (this.mode === 'create') {
      this.subscriptionForm = new FormGroup({
        client_id: new FormControl(this.clientId || '', Validators.required),
        service_type: new FormControl('Phone', Validators.required),
        carrier: new FormControl('', Validators.required),
        plan_amount: new FormControl('', [Validators.required, Validators.min(0.01)]),
        payment_due_day: new FormControl('', Validators.compose([
          Validators.min(1),
          Validators.max(31)
        ])),
      });
    } else {
      // Edit mode
      this.subscriptionForm = new FormGroup({
        status: new FormControl(this.subscription?.status || 'Unpaid', Validators.required),
        plan_amount: new FormControl(this.subscription?.plan_amount || '', [Validators.required, Validators.min(0.01)]),
        payment_due_day: new FormControl(this.subscription?.payment_due_day || '', Validators.compose([
          Validators.min(1),
          Validators.max(31)
        ])),
        is_active: new FormControl(this.subscription?.is_active ?? true),
      });
    }
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients.sort((a, b) => a.full_name.localeCompare(b.full_name));
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.error = 'Failed to load clients';
      }
    });
  }

  getClientName(clientId: number | undefined): string {
    if (!clientId || !this.clients) return 'Unknown';
    
    const foundClient = this.clients.find(c => c.id === clientId);
    return foundClient ? foundClient.full_name : 'Unknown';
  }

  onSubmit() {
    if (!this.subscriptionForm.valid) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.subscriptionForm.value;

    if (this.mode === 'create') {
      const newSubscription: Subscription = {
        client_id: Number(formValue.client_id),
        service_type: formValue.service_type,
        carrier: formValue.carrier,
        plan_amount: Number(formValue.plan_amount),
        payment_due_day: formValue.payment_due_day ? Number(formValue.payment_due_day) : undefined,
        status: 'Unpaid',
        is_active: true,
      };

      this.subscriptionService.createSubscription(newSubscription).subscribe({
        next: (response) => {
          console.log('Subscription created:', response);
          this.submitted.emit(response);
          this.close.emit();
        },
        error: (err) => {
          console.error('Error creating subscription:', err);
          this.error = err.error?.error || 'Failed to create subscription';
          this.loading = false;
        }
      });
    } else {
      // Edit mode
      if (!this.subscription?.id) return;

      const updatedSubscription: Partial<Subscription> = {
        status: formValue.status,
        plan_amount: Number(formValue.plan_amount),
        payment_due_day: formValue.payment_due_day ? Number(formValue.payment_due_day) : undefined,
        is_active: formValue.is_active,
      };

      this.subscriptionService.updateSubscription(this.subscription.id, updatedSubscription).subscribe({
        next: (response) => {
          console.log('Subscription updated:', response);
          this.submitted.emit(response);
          this.close.emit();
        },
        error: (err) => {
          console.error('Error updating subscription:', err);
          this.error = err.error?.error || 'Failed to update subscription';
          this.loading = false;
        }
      });
    }
  }
}
