import { Component, Input, Output, inject, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Icons
import { LucideAngularModule, User, Mail, Phone, Calendar, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

// Components
import { ClientTabs } from '../client-tabs/client-tabs';

// Interfaces & Services
import { Client } from '../../../../../../shared/models/client.interface';
import { ClientSummary } from '../../../../../../shared/models/clientSummary.interface';
import { ClientService } from '../../../../../../core/services/client';

@Component({
  selector: 'app-client-identity-card',
  imports: [CommonModule, ClientTabs, LucideAngularModule],
  templateUrl: './client-identity-card.html',
  styleUrl: './client-identity-card.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ User, Mail, Phone, Calendar })
    }
  ]
})
export class ClientIdentityCard implements OnChanges {
  @Input() client: Client | null = null;

  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  summary: ClientSummary | null = null;
  loading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['client'] && this.client?.id) {
      this.loadClientSummary();
    }
  }

  private loadClientSummary() {
    if (!this.client?.id) return;
    
    this.loading = true;
    this.clientService.getClientSummary(this.client.id).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
        this.cdr.detectChanges(); // Force Angular to update the view
      },
      error: (error) => {
        console.error('Error loading client summary:', error);
        this.loading = false;
        this.cdr.detectChanges(); // Force update even on error
      }
    });
  }
}
