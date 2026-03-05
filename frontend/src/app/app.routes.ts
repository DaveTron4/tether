import { Routes } from '@angular/router';

// Import Pages
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { InventoryDashboard } from './features/inventory/pages/inventory-dashboard/inventory-dashboard';
import { ClientDetail } from './features/crm/pages/client-detail/client-detail';
import { ClientList } from './features/crm/pages/client-list/client-list';
import { EmployeeList } from './features/employees/pages/employee-list/employee-list';
// import { NotFoundPage } from './shared/pages/not-found/not-found';

// Import Guards
import { authGuard } from './core/guards/auth-guard';
import { loginGuard } from './core/guards/login-guard';
import { adminGuard } from './core/guards/admin-guard';

// Import Layouts
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { AuthLayout } from './features/auth/layout/auth-layout/auth-layout';

export const routes: Routes = [
    // =====================
    // Authentication routes (public)
    // ====================
    {
        path: '',
        component: AuthLayout,
        canActivate: [loginGuard],
        children: [
            { path: 'login', component: LoginPage },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },

    // Protected routes (require authentication)
    {
        path: '', 
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            // =====================
            // Inventory routes
            // ====================
            { path: 'inventory', component: InventoryDashboard },
        
            // =====================
            // CRM routes
            // ====================
            { path: 'clients', component: ClientList },
            { path: 'clients/:id', component: ClientDetail },

            // =====================
            // Admin routes (only visible to admins in the UI, but also protected by adminGuard)
            // ====================
            { path: 'employees', component: EmployeeList, canActivate: [adminGuard] },
        
            // =====================
            // Default route
            // ====================
            { path: '', redirectTo: '/inventory', pathMatch: 'full' },
        ]
    },

    // {
    //     path: '**',
    //     component: NotFoundPage
    // },

     
];