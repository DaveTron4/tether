export interface AuthResponse {
  token: string;
  user: {
    id: number;
    tenantId: string;
    username: string;
    fullName: string;
    email?: string;
    role: 'superadmin' | 'admin' | 'employee';
  };
}