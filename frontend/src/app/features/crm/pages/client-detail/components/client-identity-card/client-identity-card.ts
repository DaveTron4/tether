import { Component } from '@angular/core';
import { Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Icons
import { LucideAngularModule, User, Mail, Phone, Calendar, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

// Components
import { ClientTabs } from '../client-tabs/client-tabs';

// Interfaces
import { Client } from '../../../../../../shared/models/client.interface';

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
export class ClientIdentityCard {
  @Input() client: Client | null = null;
}
