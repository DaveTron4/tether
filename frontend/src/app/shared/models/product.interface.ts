export interface Product {
  id?: number; 
  name: string;
  barcode: string;
  
  category: 'Phone' | 'Case' | 'Charger' | 'Service' | string;
  is_generic: boolean;
  
  price: number; 
  cost: number;  
  
  stock_quantity: number;
  min_stock_level: number;
  
  properties?: Record<string, any>; 
  
  created_at?: string;
}