import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  private clientService = inject(ClientService);
  private subscriptionService = inject(SubscriptionService);

  constructor() {
    this.clientForm = new FormGroup({
      fullName: new FormControl('', Validators.required),
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
    // Validate that at least fullName is filled
    if (!this.clientForm.get('fullName')?.value?.trim()) {
      alert('Please enter customer full name.');
      return;
    }

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

    // Filter subscriptions to only include those with carrier and plan_amount
    const subscriptions = this.subscriptionsArray.value
      .map((subscription: any) => ({
        service_type: subscription.service_type,
        carrier: subscription.carrier?.trim() || '',
        plan_amount: Number(subscription.plan_amount),
        payment_due_day: subscription.payment_due_day ? Number(subscription.payment_due_day) : undefined,
      }))
      .filter((subscription: any) => subscription.carrier && !Number.isNaN(subscription.plan_amount) && subscription.plan_amount > 0);

    // Create client first
    this.clientService.createClient(newClient).pipe(
      switchMap((createdClient) => {
        console.log('Client created with ID:', createdClient.id);
        
        // If there are subscriptions to add, create them
        if (subscriptions.length > 0) {
          const requests = subscriptions.map((subscription: any) => {
            console.log('Creating subscription:', { ...subscription, client_id: createdClient.id });
            return this.subscriptionService.createSubscription({
              ...subscription,
              client_id: createdClient.id,
            }).pipe(
              // Use catchError to handle individual subscription failures
              switchMap(
                (subResponse) => {
                  console.log('Subscription created:', subResponse);
                  return of(subResponse);
                }
              )
            );
          });
          return forkJoin(requests).pipe(
            map(() => createdClient),
            switchMap(() => of(createdClient))
          );
        }

        // No subscriptions to add
        return of(createdClient);
      })
    ).subscribe({
      next: (response) => {
        console.log('Client and subscriptions created successfully:', response);
        const subText = subscriptions.length > 0 ? ` with ${subscriptions.length} subscription(s)` : ' (no subscriptions)';
        alert(`Client created successfully${subText}!`);
        this.close.emit();
      },
      error: (error) => {
        console.error('Error during client/subscription creation:', error);
        console.error('Full error details:', JSON.stringify(error));
        
        // Show user-friendly error message
        let errorMessage = 'Failed to create client or subscriptions.';
        if (error.error?.error) {
          errorMessage += ` Server: ${error.error.error}`;
        }
        alert(errorMessage);
      }
    });
  }
}
