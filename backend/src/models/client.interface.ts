// client.model.ts
import type { Subscription } from './subscription.interface.js';

export interface Client {
  id?: number; 
  full_name: string;
  phone_number?: string;
  zip_code?: string;
  notes?: string;
  
  subscriptions?: Subscription[]; 
  status?: 'Active' | 'Inactive' | 'Debt';

  last_visit?: string;
  created_at?: string; 
  updated_at?: string;
}