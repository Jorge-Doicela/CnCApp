import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
    {
        path: 'ver-perfil',
        loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'ver-conferencias',
        loadComponent: () => import('./conferencias/conferencias.page').then(m => m.ConferenciasPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'ver-certificaciones',
        loadComponent: () => import('./certificaciones/certificaciones.page').then(m => m.CertificacionesPage),
        canActivate: [AuthGuard]
    }
];
