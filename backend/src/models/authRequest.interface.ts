import type { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    tenant_id: string;
    username: string;
    role: 'admin' | 'employee' | 'superadmin';
  };
}