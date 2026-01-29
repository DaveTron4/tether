
export interface PaymentHistory {
    id?: number;
    client_id: number;
    amount_paid: number;
    status: 'Paid' | 'Unpaid' | 'Processing' | 'Failed';
    error_message?: string;
    attempted_at?: Date | string;
}