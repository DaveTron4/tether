import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';

// Interfaces
import { Client } from '../../../../../../shared/models/client.interface';

@Component({
  selector: 'app-tab-financials',
  imports: [],
  templateUrl: './tab-financials.html',
  styleUrl: './tab-financials.css',
})
export class TabFinancials {
 @Input() client: Client | null = null;
}
