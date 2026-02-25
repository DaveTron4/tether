import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';

// Interfaces
import { Client } from '../../../../../../shared/models/client.interface';

// Components
import { TabOverview } from '../tab-overview/tab-overview';
import {TabDevices } from '../tab-devices/tab-devices';
import { TabFinancials } from '../tab-financials/tab-financials';

@Component({
  selector: 'app-client-tabs',
  imports: [CommonModule, TabOverview, TabDevices, TabFinancials],
  templateUrl: './client-tabs.html',
  styleUrl: './client-tabs.css',
})
export class ClientTabs {
  @Input() client: Client | null = null;
  activeTab = signal('overview');

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }
}
