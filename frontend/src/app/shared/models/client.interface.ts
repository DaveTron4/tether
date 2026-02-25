// client.model.ts
export interface Client {
  id?: number; 
  full_name: string;
  phone_number?: string;
  email?: string;
  zip_code?: string;
  notes?: string;
  status?: 'Active' | 'Inactive' | 'Debt';

  last_visit?: string;
  created_at?: string; 
}