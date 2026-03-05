export interface User {
    id?: number;
    tenant_id?: string;
    tenant_name?: string;

    username: string;
    email?: string;
    full_name?: string;

    role: 'superadmin' | 'admin' | 'employee';

    created_at?: Date | string;
}