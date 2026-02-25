import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';

// Interfaces
import { Client } from '../../../../../../shared/models/client.interface';

@Component({
  selector: 'app-tab-overview',
  imports: [CommonModule],
  templateUrl: './tab-overview.html',
  styleUrl: './tab-overview.css',
})
export class TabOverview {
 @Input() client: Client | null = null;
}
