export interface Device {
  id?: number;
  tenant_id?: string;
  client_id: number;
  device_type?: string;
  manufacturer?: string;
  model: string;
  imei_serial?: string;
  color?: string;
  device_passcode?: string;
  created_at?: string;
}

export type CreateDeviceInput = Omit<Device, 'id' | 'tenant_id' | 'created_at'>;

export type UpdateDeviceInput = Partial<
  Omit<Device, 'id' | 'tenant_id' | 'client_id' | 'created_at'>
>;

export interface DeleteDeviceResponse {
  message: string;
}
