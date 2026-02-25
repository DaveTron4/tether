// payment-history.model.ts

export interface PaymentHistory {
  id?: number;

  subscription_id: number; 
  
  amount_paid: number;
  status: 'Paid' | 'Failed'; 
  created_at?: string;
}