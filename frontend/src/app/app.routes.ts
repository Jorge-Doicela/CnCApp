import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';



export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '',
        loadChildren: () => import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
