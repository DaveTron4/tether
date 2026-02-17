import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MoreHorizontal,Plus, Search, Edit, Trash2, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';

// Components
import { ClientTable } from '../../components/client-table/client-table';
import { ClientFormModal } from '../../components/client-form-modal/client-form-modal';

// Interfaces
import { Client } from '../../../../shared/models/client.interface';

// Services
import { ClientService } from '../../../../core/services/client';

@Component({
  selector: 'app-client-list',
  imports: [CommonModule, LucideAngularModule, ClientTable, ClientFormModal],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ MoreHorizontal, Plus, Search, Edit, Trash2 })
    }
  ]
})
export class ClientList implements OnInit{

  private clientService = inject(ClientService);

  private rawClients = signal<Client[]>([]); 

  protected searchQuery = signal<string>('');

  protected filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const all = this.rawClients();

    // If search is empty, return everything
    if (!query) return all;

    // Otherwise, filter by Name, Phone, or Email
    return all.filter(client => 
      client.full_name?.toLowerCase().includes(query) || 
      client.phone_number?.includes(query)
    );
  });

  ngOnInit(): void {
    this.clientService.getClients().subscribe((data) => {
      this.rawClients.set(data); // Store the data in the signal
    });
  }     

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value); // Update the signal
  }

  // Modal state for creating a client
  protected showCreateModal = signal<boolean>(false);

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  openEditModal(client: Client) {
    console.log('Editing client:', client);
    // Logic to open modal goes here
  }
}
