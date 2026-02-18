import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../../core/services/client';
import { Client } from '../../../../shared/models/client.interface';


@Component({
  selector: 'app-client-detail',
  imports: [CommonModule],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.css',
})
export class ClientDetail {
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);

  client = signal<Client | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');  
    
    if (id) {
      this.clientService.getClientById(+id).subscribe((data) => {
        this.client.set(data);
      });
    }
  }
}
