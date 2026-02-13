import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { InventoryDashboard } from './features/inventory/pages/inventory-dashboard/inventory-dashboard';
import { ClientDetail } from './features/crm/pages/client-detail/client-detail';
import { ClientList } from './features/crm/pages/client-list/client-list';

export const routes: Routes = [
    // =====================
    // Authentication routes
    // ====================
    { 
        path: 'login', 
        component: LoginPage 
    },

    // =====================
    // Inventory routes
    // ====================
    { 
        path: 'inventory', 
        component: InventoryDashboard 
    },
  
    // =====================
    // CRM routes
    // ====================
    { 
        path: 'clients', 
        component: ClientDetail 
    },
    { 
        path: 'clients-list', 
        component: ClientList 
    },
  
    // =====================
    // Default route
    // ====================
    { 
        path: '', 
        redirectTo: '/inventory', 
        pathMatch: 'full' 
    }, 
];