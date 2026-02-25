import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';

// Interfaces
import { Client } from '../../../../../../shared/models/client.interface';

@Component({
  selector: 'app-tab-devices',
  imports: [CommonModule],
  templateUrl: './tab-devices.html',
  styleUrl: './tab-devices.css',
})
export class TabDevices {
 @Input() client: Client | null = null;
}
