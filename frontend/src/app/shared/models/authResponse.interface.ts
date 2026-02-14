export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    role: 'admin' | 'employee';
  };
}