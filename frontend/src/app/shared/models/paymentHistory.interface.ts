// payment-history.model.ts

export interface PaymentHistory {
  id?: number;
  tenant_id?: string;

  subscription_id: number;

  amount_paid: number;
  status: 'Paid' | 'Failed';
  created_at?: string;
}