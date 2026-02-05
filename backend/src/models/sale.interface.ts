// sale.model.ts
// Represents an individual item in a Sale
export interface SaleItem {
  id?: number;
  sale_id?: number;
  
  product_id: number;
  product_name?: string;
  
  quantity: number;
  price_at_sale: number; 
}

// sale.model.ts
// Represents a Sale transaction
export interface Sale {
  id?: number;
  
  user_id: number;
  client_id?: number; 
  
  total_amount: number;
  payment_method: 'Cash' | 'Card' | 'Other';
  
  items?: SaleItem[]; 
  
  created_at?: string;
}