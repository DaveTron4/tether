// subscription.model.ts

export interface Subscription {
  id?: number;
  client_id?: number; 
  

  service_type: 'Phone' | 'WiFi'; 
  
  carrier: string;     
  plan_amount: number;   
  payment_due_day?: number;
  
  status: 'Paid' | 'Unpaid' | 'Overdue'; 
  last_payment_at?: string | Date; 
  is_active: boolean;
  
  created_at?: string;
}