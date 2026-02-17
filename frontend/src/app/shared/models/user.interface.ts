
export interface User {
    id?: number;
    username: string;
    email?: string;
    password_hash: string;
    role: 'admin' | 'employee';
    full_name?: string;
    created_at?: Date | string;
}