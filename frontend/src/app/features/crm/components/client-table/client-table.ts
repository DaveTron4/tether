import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MoreHorizontal, Edit, Trash2, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Client } from '../../../../shared/models/client.interface';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule], // Don't forget imports!
  templateUrl: './client-table.html',
  styleUrl: './client-table.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ MoreHorizontal, Edit, Trash2 })
    }
  ]
})
export class ClientTable{
  @Input() clients: Client[] = [];
  @Output() onEdit = new EventEmitter<Client>();
}