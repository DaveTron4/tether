
export interface User {
    id?: number;
    username: string;
    password_hash: string; // Store HASHED password, not plain text
    role: 'admin' | 'employee';
    full_name?: string;
    created_at?: Date | string;
}