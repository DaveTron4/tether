import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeviceService } from '../../../core/services/device';
import {
  CreateDeviceInput,
  Device,
  UpdateDeviceInput,
} from '../../models/device.interface';

@Component({
  selector: 'app-device-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './device-form-modal.html',
  styleUrl: './device-form-modal.css',
})
export class DeviceFormModal {
  @Input() clientId!: number;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() device?: Device;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<Device>();

  private deviceService = inject(DeviceService);

  deviceForm = new FormGroup({
    device_type: new FormControl('', Validators.required),
    manufacturer: new FormControl('', Validators.required),
    model: new FormControl('', Validators.required),
    imei_serial: new FormControl(''),
    color: new FormControl(''),
    device_passcode: new FormControl(''),
  });
  loading = false;
  error: string | null = null;

  ngOnInit() {
    if (this.mode === 'edit' && this.device) {
      this.deviceForm.patchValue({
        device_type: this.device.device_type ?? '',
        manufacturer: this.device.manufacturer ?? '',
        model: this.device.model,
        imei_serial: this.device.imei_serial ?? '',
        color: this.device.color ?? '',
        device_passcode: this.device.device_passcode ?? '',
      });
    }
  }

  onSubmit() {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      this.error = 'Please complete the required fields.';
      return;
    }

    this.loading = true;
    this.error = null;
    const value = this.deviceForm.getRawValue();

    if (this.mode === 'create') {
      const device: CreateDeviceInput = {
        client_id: this.clientId,
        device_type: value.device_type!,
        manufacturer: value.manufacturer!,
        model: value.model!,
        imei_serial: value.imei_serial || undefined,
        color: value.color || undefined,
        device_passcode: value.device_passcode || undefined,
      };

      this.deviceService.createDevice(device).subscribe({
        next: (createdDevice) => {
          this.submitted.emit(createdDevice);
          this.close.emit();
        },
        error: (err) => this.handleError(err, 'Failed to register device.'),
      });
      return;
    }

    if (!this.device?.id) {
      this.error = 'The device could not be identified.';
      this.loading = false;
      return;
    }

    const updates: UpdateDeviceInput = {
      device_type: value.device_type!,
      manufacturer: value.manufacturer!,
      model: value.model!,
      imei_serial: value.imei_serial || undefined,
      color: value.color || undefined,
      device_passcode: value.device_passcode || undefined,
    };

    this.deviceService.updateDevice(this.device.id, updates).subscribe({
      next: (updatedDevice) => {
        this.submitted.emit(updatedDevice);
        this.close.emit();
      },
      error: (err) => this.handleError(err, 'Failed to update device.'),
    });
  }

  private handleError(error: { error?: { error?: string } }, fallback: string) {
    console.error(error);
    this.error = error.error?.error || fallback;
    this.loading = false;
  }
}
