import { Routes } from '@angular/router';

// Import Pages
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { InventoryDashboard } from './features/inventory/pages/inventory-dashboard/inventory-dashboard';
import { ClientDetail } from './features/crm/pages/client-detail/client-detail';
import { ClientList } from './features/crm/pages/client-list/client-list';
import { RegisterPage } from './features/auth/pages/register-page/register-page';
// import { NotFoundPage } from './shared/pages/not-found/not-found';

// Import Guards
import { authGuard } from './core/guards/auth-guard';
import { loginGuard } from './core/guards/login-guard';

// Import Layouts
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { AuthLayout } from './features/auth/layout/auth-layout/auth-layout';

export const routes: Routes = [
    // =====================
    // Authentication routes
    // ====================
    {
        path: '', // Matches /auth
        component: AuthLayout,
        canActivate: [loginGuard],
        children: [
            { path: 'login', component: LoginPage },       // /auth/login
            { path: 'register', component: RegisterPage }, // /auth/register
            { path: '', redirectTo: 'login', pathMatch: 'full' }    // Default
        ]
    },

    // Protected routes (require authentication)
    {
        path: '', 
        component: MainLayout,
        canActivate: [authGuard], // Bonus: Protects all children at once!
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