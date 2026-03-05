
export interface User {
    id?: number;
    tenant_id: string;
    username: string;
    email?: string;
    password_hash: string;
    role: 'superadmin' | 'admin' | 'employee';
    full_name?: string;
    created_at?: Date | string;
}