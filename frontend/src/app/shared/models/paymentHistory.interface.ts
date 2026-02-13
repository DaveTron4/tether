// payment-history.model.ts

export interface PaymentHistory {
  id?: number;

  subscription_id: number; 
  
  amount_paid: number;
  status: 'Paid' | 'Failed'; 

  error_message?: string;
  created_at?: string;
}