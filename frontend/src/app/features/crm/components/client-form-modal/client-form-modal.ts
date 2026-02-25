import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, X, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Services
import { ClientService } from '../../../../core/services/client';
import { SubscriptionService } from '../../../../core/services/subscription';

// Client Interface
import { Client } from '../../../../shared/models/client.interface';
import { Subscription } from '../../../../shared/models/subscription.interface';


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

  constructor(
    private clientService: ClientService,
    private subscriptionService: SubscriptionService
  ) {
    this.clientForm = new FormGroup({
      fullName: new FormControl(''),
      phone: new FormControl(''),
      email: new FormControl(''),
      zipCode: new FormControl(''),
      notes: new FormControl(''),
      subscriptions: new FormArray([]),
      status: new FormControl('Active'),
    });

    this.addSubscription();
  }

  get subscriptionsArray() {
    return this.clientForm.get('subscriptions') as FormArray;
  }

  get subscriptionControls() {
    return this.subscriptionsArray.controls;
  }

  addSubscription() {
    const subscriptionGroup = new FormGroup({
      service_type: new FormControl('Phone'),
      carrier: new FormControl(''),
      plan_amount: new FormControl(''),
      payment_due_day: new FormControl(''),
    });

    this.subscriptionsArray.push(subscriptionGroup);
  }

  removeSubscription(index: number) {
    this.subscriptionsArray.removeAt(index);
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
        status: formValue.status,
        last_visit: new Date().toISOString(),
      };

      const subscriptions = this.subscriptionsArray.value
        .map((subscription: any) => ({
          service_type: subscription.service_type,
          carrier: subscription.carrier,
          plan_amount: Number(subscription.plan_amount),
          payment_due_day: subscription.payment_due_day
            ? Number(subscription.payment_due_day)
            : undefined,
        }))
        .filter((subscription: Subscription) =>
          subscription.carrier && !Number.isNaN(subscription.plan_amount)
        );

      this.clientService.createClient(newClient).pipe(
        switchMap((createdClient) => {
          const requests = subscriptions.map((subscription: Subscription) =>
            this.subscriptionService.createSubscription({
              ...subscription,
              client_id: createdClient.id,
            })
          );

          if (requests.length === 0) {
            return of(createdClient);
          }

          return forkJoin(requests).pipe(map(() => createdClient));
        })
      ).subscribe({
        next: (response) => {
          console.log('Client created:', response);
          alert('Client created successfully!');
          this.close.emit();
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
