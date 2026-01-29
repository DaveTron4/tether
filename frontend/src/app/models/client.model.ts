// client.model.ts (Frontend) OR client.interface.ts (Backend)

export interface Client {
  id?: number;          // Optional because new clients don't have an ID yet
  full_name: string;
  phone_number?: string;
  zip_code?: string;
  carrier: string;      // e.g. 'Comcast', 'Verizon'
  
  plan_amount: number;  // DECIMAL(10,2) comes from DB as a string usually, but cast to number in JS
  payment_due_day?: number;
  
  status: 'Paid' | 'Unpaid' | 'Processing' | 'Failed'; 
  last_payment_at?: Date | string;
  is_active: boolean;
  
  created_at?: Date | string;
  updated_at?: Date | string;
}