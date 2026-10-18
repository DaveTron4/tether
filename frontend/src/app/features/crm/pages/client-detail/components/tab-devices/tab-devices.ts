import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../../../../../shared/models/client.interface';
import { Device } from '../../../../../../shared/models/device.interface';
import { DeviceService } from '../../../../../../core/services/device';
import { DeviceFormModal } from '../../../../../../shared/components/device-form-modal/device-form-modal';
import { RepairFormModal } from '../../../../../../shared/components/repair-form-modal/repair-form-modal';

@Component({
  selector: 'app-tab-devices',
  imports: [CommonModule, DeviceFormModal, RepairFormModal],
  templateUrl: './tab-devices.html',
  styleUrl: './tab-devices.css',
})
export class TabDevices implements OnChanges {
  @Input() client: Client | null = null;

  private deviceService = inject(DeviceService);
  devices = signal<Device[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeviceModal = signal(false);
  selectedDevice = signal<Device | undefined>(undefined);
  showRepairModal = signal(false);
  repairDevice = signal<Device | undefined>(undefined);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['client'] && this.client?.id) {
      this.loadDevices();
    }
  }

  loadDevices() {
    if (!this.client?.id) return;
    this.loading.set(true);
    this.error.set(null);
    this.deviceService.getDevicesByClientId(this.client.id).subscribe({
      next: (devices) => {
        this.devices.set(devices);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading devices:', err);
        this.error.set(err.error?.error || 'Failed to load devices.');
        this.loading.set(false);
      },
    });
  }

  openCreateModal() {
    this.selectedDevice.set(undefined);
    this.showDeviceModal.set(true);
  }

  openEditModal(device: Device) {
    this.selectedDevice.set(device);
    this.showDeviceModal.set(true);
  }

  closeModal() {
    this.showDeviceModal.set(false);
    this.selectedDevice.set(undefined);
  }

  onDeviceSubmitted() {
    this.closeModal();
    this.loadDevices();
  }

  deleteDevice(device: Device) {
    if (!device.id || !confirm(`Delete ${device.model}?`)) return;
    this.deviceService.deleteDevice(device.id).subscribe({
      next: () => this.loadDevices(),
      error: (err) => {
        console.error('Error deleting device:', err);
        this.error.set(err.error?.error || 'Failed to delete device.');
      },
    });
  }

  openRepairModal(device: Device) {
    this.repairDevice.set(device);
    this.showRepairModal.set(true);
  }

  closeRepairModal() {
    this.showRepairModal.set(false);
    this.repairDevice.set(undefined);
  }
}
