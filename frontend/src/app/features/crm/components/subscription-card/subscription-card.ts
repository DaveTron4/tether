import { Component, Input, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Phone, Wifi, Calendar, DollarSign, CheckCircle, AlertCircle, Clock, Edit2, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Subscription } from '../../../../shared/models/subscription.interface';

@Component({
  selector: 'app-subscription-card',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './subscription-card.html',
  styleUrl: './subscription-card.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Phone, Wifi, Calendar, DollarSign, CheckCircle, AlertCircle, Clock, Edit2 })
    }
  ]
})
export class SubscriptionCard {
  @Input() subscription: Subscription | null = null;
  @Output() edit = new EventEmitter<Subscription>();

  statusColor = computed(() => {
    if (!this.subscription) return 'gray';
    if (this.subscription.status === 'Paid') return 'green';
    if (this.subscription.status === 'Overdue') return 'red';
    return 'orange';
  });

  statusIcon = computed(() => {
    if (!this.subscription) return 'clock';
    if (this.subscription.status === 'Paid') return 'check-circle';
    if (this.subscription.status === 'Overdue') return 'alert-circle';
    return 'clock';
  });

  serviceIcon = computed(() => {
    return this.subscription?.service_type === 'Phone' ? 'phone' : 'wifi';
  });

  get formattedAmount(): string {
    if (!this.subscription) return '$0.00';
    const amount = typeof this.subscription.plan_amount === 'string' 
      ? parseFloat(this.subscription.plan_amount) 
      : this.subscription.plan_amount;
    return `$${amount.toFixed(2)}`;
  }

  get formattedLastPayment(): string {
    if (!this.subscription?.last_payment_at) return 'Never';
    const date = new Date(this.subscription.last_payment_at);
    return date.toLocaleDateString();
  }
}
