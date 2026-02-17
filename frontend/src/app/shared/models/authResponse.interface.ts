export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    password_hash: string;
    role: 'admin' | 'employee';
  };
}