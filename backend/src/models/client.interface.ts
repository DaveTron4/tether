// client.model.ts
export interface Client {
  id?: number; 
  full_name: string;
  email?: string;
  phone_number?: string;
  zip_code?: string;
  notes?: string;
  
  status?: 'Active' | 'Inactive' | 'Debt';

  last_visit?: string;
  created_at?: string; 
}