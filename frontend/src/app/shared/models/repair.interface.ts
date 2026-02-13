// repair.model.ts
// Represents a Repair Ticket for device repairs
export interface RepairTicket {
  id?: number;
  
  client_id: number;
  client_name?: string;
  
  device_model: string;
  issue_description: string; 
  
  status: 'Intake' | 'In Progress' | 'Waiting for Parts' | 'Done' | 'Picked Up';
  
  estimated_cost: number;
  
  created_at?: string;
  completed_at?: string;
}