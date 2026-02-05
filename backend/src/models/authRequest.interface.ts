export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'admin' | 'employee';
  };
}