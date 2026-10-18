import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../models/client.interface';
import { Device } from '../../models/device.interface';
import { RepairTicket } from '../../models/repair.interface';
import { ClientService } from '../../../core/services/client';
import { DeviceService } from '../../../core/services/device';
import { RepairService } from '../../../core/services/repair';

@Component({
  selector: 'app-repair-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './repair-form-modal.html',
  styleUrl: './repair-form-modal.css',
})
export class RepairFormModal implements OnChanges {
  @Input() clientId?: number;
  @Input() deviceId?: number;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<RepairTicket>();

  private clientService = inject(ClientService);
  private deviceService = inject(DeviceService);
  private repairService = inject(RepairService);

  clients: Client[] = [];
  devices: Device[] = [];
  loading = false;
  error: string | null = null;
  form = new FormGroup({
    client_id: new FormControl<number | null>(null, Validators.required),
    device_id: new FormControl<number | null>(null, Validators.required),
    issue_description: new FormControl('', Validators.required),
    status: new FormControl<RepairTicket['status']>('Intake', Validators.required),
    estimated_cost: new FormControl<number | null>(0, [Validators.min(0)]),
    parts_cost: new FormControl<number | null>(0, [Validators.min(0)]),
    labor_cost: new FormControl<number | null>(0, [Validators.min(0)]),
    charge_amount: new FormControl<number | null>(0, [Validators.min(0)]),
  });

  ngOnInit() {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients.sort((a, b) => a.full_name.localeCompare(b.full_name));
        this.setInitialSelections();
      },
      error: (err) => this.setError(err, 'Failed to load clients.'),
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clientId'] || changes['deviceId']) {
      this.setInitialSelections();
    }
  }

  onClientChange() {
    const selectedClientId = this.form.controls.client_id.value;
    this.devices = [];
    this.form.controls.device_id.reset(null);
    if (!selectedClientId) return;
    this.deviceService.getDevicesByClientId(selectedClientId).subscribe({
      next: (devices) => {
        this.devices = devices;
        if (this.deviceId && devices.some((device) => device.id === this.deviceId)) {
          this.form.controls.device_id.setValue(this.deviceId);
        }
      },
      error: (err) => this.setError(err, 'Failed to load devices for this client.'),
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Select a client and device, then describe the repair.';
      return;
    }

    this.loading = true;
    this.error = null;
    const value = this.form.getRawValue();
    const repair = {
      client_id: value.client_id!,
      device_id: value.device_id!,
      issue_description: value.issue_description!,
      status: value.status!,
      estimated_cost: value.estimated_cost ?? 0,
      parts_cost: value.parts_cost ?? 0,
      labor_cost: value.labor_cost ?? 0,
      charge_amount: value.charge_amount ?? 0,
      amount_paid: 0,
    };

    this.repairService.createRepair(repair).subscribe({
      next: (created) => {
        this.submitted.emit(created);
        this.close.emit();
      },
      error: (err) => this.setError(err, 'Failed to create repair ticket.'),
    });
  }

  private setInitialSelections() {
    if (!this.clientId || !this.clients.length) return;
    this.form.controls.client_id.setValue(this.clientId);
    this.onClientChange();
  }

  private setError(error: { error?: { error?: string } }, fallback: string) {
    console.error(error);
    this.error = error.error?.error || fallback;
    this.loading = false;
  }
}
