import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MoreHorizontal, Edit, Trash2, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Client } from '../../../../shared/models/client.interface';

@Component({
  selector: 'app-client-list',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ MoreHorizontal, Edit, Trash2 })
    }
  ]
})
export class ClientList {

}
