import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../../../shared/models/client.interface';
import { Device } from '../../../../shared/models/device.interface';
import { RepairTicket } from '../../../../shared/models/repair.interface';
import { ClientService } from '../../../../core/services/client';
import { DeviceService } from '../../../../core/services/device';
import { RepairService } from '../../../../core/services/repair';
import { RepairFormModal } from '../../../../shared/components/repair-form-modal/repair-form-modal';

@Component({
  selector: 'app-repairs',
  imports: [CommonModule, RepairFormModal],
  templateUrl: './repairs.html',
  styleUrl: './repairs.css',
})
export class Repairs {
  private clientService = inject(ClientService);
  private deviceService = inject(DeviceService);
  private repairService = inject(RepairService);

  clients: Client[] = [];
  devices: Device[] = [];
  repairs = signal<RepairTicket[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showCreateModal = signal(false);
  searchTerm = signal('');
  statusFilter = signal<'All' | RepairTicket['status']>('All');
  clientFilter = signal<number | 'All'>('All');

  readonly statuses: RepairTicket['status'][] = ['Intake', 'In Progress', 'Done', 'Picked Up'];
  readonly filterStatuses: Array<'All' | RepairTicket['status']> = ['All', ...this.statuses];

  filteredRepairs = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const client = this.clientFilter();

    return this.repairs().filter((repair) => {
      const matchesStatus = status === 'All' || repair.status === status;
      const matchesClient = client === 'All' || repair.client_id === client;
      const matchesSearch = !search
        || this.clientName(repair.client_id).toLowerCase().includes(search)
        || this.deviceName(repair.device_id).toLowerCase().includes(search)
        || (repair.issue_description || '').toLowerCase().includes(search);
      return matchesStatus && matchesClient && matchesSearch;
    });
  });

  get totalRepairs() {
    return this.repairs().length;
  }

  get activeRepairs() {
    return this.repairs().filter((repair) => repair.status === 'Intake' || repair.status === 'In Progress').length;
  }

  get completedRepairs() {
    return this.repairs().filter((repair) => repair.status === 'Done' || repair.status === 'Picked Up').length;
  }

  get estimatedValue() {
    return this.repairs().reduce((total, repair) => total + Number(repair.estimated_cost || 0), 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);
    this.clientService.getClients().subscribe({
      next: (clients) => (this.clients = clients),
      error: (err) => this.setError(err, 'Failed to load clients.'),
    });
    this.deviceService.getDevices().subscribe({
      next: (devices) => (this.devices = devices),
      error: (err) => this.setError(err, 'Failed to load devices.'),
    });
    this.repairService.getRepairs().subscribe({
      next: (repairs) => {
        this.repairs.set(repairs);
        this.loading.set(false);
      },
      error: (err) => this.setError(err, 'Failed to load repair tickets.'),
    });
  }

  repairsByStatus(status: RepairTicket['status']) {
    return this.repairs().filter((repair) => repair.status === status);
  }

  clientName(clientId: number) {
    return this.clients.find((client) => client.id === clientId)?.full_name || `Client #${clientId}`;
  }

  deviceName(deviceId: number) {
    const device = this.devices.find((item) => item.id === deviceId);
    return device ? `${device.manufacturer || ''} ${device.model}`.trim() : `Device #${deviceId}`;
  }

  updateStatus(repair: RepairTicket, status: RepairTicket['status']) {
    if (!repair.id || repair.status === status) return;
    this.repairService.updateRepair(repair.id, { status }).subscribe({
      next: (updated) => this.repairs.update((items) => items.map((item) => item.id === updated.id ? updated : item)),
      error: (err) => this.setError(err, 'Failed to update repair status.'),
    });
  }

  onRepairCreated() {
    this.closeModal();
    this.loadData();
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  refresh() {
    this.loadData();
  }

  setSearchTerm(value: string) {
    this.searchTerm.set(value);
  }

  setStatusFilter(value: string) {
    this.statusFilter.set(value as 'All' | RepairTicket['status']);
  }

  setClientFilter(value: string) {
    this.clientFilter.set(value === 'All' ? 'All' : Number(value));
  }

  closeModal() {
    this.showCreateModal.set(false);
  }

  private setError(error: { error?: { error?: string } }, fallback: string) {
    console.error(error);
    this.error.set(error.error?.error || fallback);
    this.loading.set(false);
  }

}
