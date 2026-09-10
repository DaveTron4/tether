import { Component, Input, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, RefreshCw, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { forkJoin } from 'rxjs';

// Interfaces
import { Client } from '../../../../../../shared/models/client.interface';
import { Subscription } from '../../../../../../shared/models/subscription.interface';
import { ClientSummary } from '../../../../../../shared/models/clientSummary.interface';

// Services
import { SubscriptionService } from '../../../../../../core/services/subscription';
import { ClientService } from '../../../../../../core/services/client';

// Components
import { SubscriptionCard } from '../../../../components/subscription-card/subscription-card';
import { SubscriptionFormModal } from '../../../../../../shared/components/subscriptions-form-modal/subscription-form-modal/subscription-form-modal';

@Component({
  selector: 'app-tab-overview',
  imports: [CommonModule, SubscriptionCard, SubscriptionFormModal, LucideAngularModule],
  templateUrl: './tab-overview.html',
  styleUrl: './tab-overview.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Plus, RefreshCw })
    }
  ]
})
export class TabOverview implements OnInit {
  @Input() client: Client | null = null;

  private subscriptionService = inject(SubscriptionService);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  subscriptions = signal<Subscription[]>([]);
  summary = signal<ClientSummary | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal state
  showCreateModal = signal(false);
  showEditModal = signal(false);
  selectedSubscription = signal<Subscription | undefined>(undefined);

  ngOnInit() {
    if (this.client?.id) {
      this.loadData();
    }
  }

  loadData() {
    if (!this.client?.id) return;

    this.loading.set(true);
    this.error.set(null);

    // Load both subscriptions and summary in parallel, but wait for both to complete
    forkJoin({
      subscriptions: this.subscriptionService.getClientSubscriptions(this.client.id),
      summary: this.clientService.getClientSummary(this.client.id)
    }).subscribe({
      next: (results) => {
        console.log('Data loaded successfully:', results);
        this.subscriptions.set(results.subscriptions);
        this.summary.set(results.summary);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error.set('Failed to load data. Please try again.');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  refresh() {
    this.loadData();
  }

  get balanceDue(): number {
    return this.summary()?.balanceDue || 0;
  }

  get activeSubscriptionsCount(): number {
    return this.subscriptions().filter(s => s.is_active).length;
  }

  get paidSubscriptionsCount(): number {
    return this.subscriptions().filter(s => s.status === 'Paid').length;
  }

  get unpaidSubscriptionsCount(): number {
    return this.subscriptions().filter(s => s.status === 'Unpaid' || s.status === 'Overdue').length;
  }

  onOpenCreateModal() {
    console.log('Opening create modal, current state:', this.showCreateModal());
    this.showCreateModal.set(true);
    console.log('After set, state:', this.showCreateModal());
  }

  onOpenEditModal(subscription: Subscription) {
    console.log('Opening edit modal for subscription:', subscription);
    this.selectedSubscription.set(subscription);
    this.showEditModal.set(true);
    console.log('After set, edit state:', this.showEditModal());
  }

  onCloseModal() {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.selectedSubscription.set(undefined);
  }

  onSubscriptionSubmitted(subscription: Subscription) {
    this.onCloseModal();
    this.loadData();
  }
}
