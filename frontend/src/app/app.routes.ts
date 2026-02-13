import { Routes } from '@angular/router';

// Import Pages
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { InventoryDashboard } from './features/inventory/pages/inventory-dashboard/inventory-dashboard';
import { ClientDetail } from './features/crm/pages/client-detail/client-detail';
import { ClientList } from './features/crm/pages/client-list/client-list';

// Import Guards
import { authGuard } from './core/guards/auth-guard';

// Import Layouts
import { MainLayout } from './core/layouts/main-layout/main-layout';
// import { NotFoundPage } from './shared/pages/not-found/not-found';

export const routes: Routes = [
    // =====================
    // Authentication routes
    // ====================
    { 
        path: '', 
        component: LoginPage 
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