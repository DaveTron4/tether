
export interface User {
    id?: number;
    username: string;
    password_hash: string;
    role: 'admin' | 'employee';
    full_name?: string;
    created_at?: Date | string;
}