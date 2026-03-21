import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
    {
        path: 'ver-perfil',
        loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage),
        canActivate: [authGuard]
    },
    {
        path: 'ver-perfil/editar',
        loadComponent: () => import('./perfil/editar/editar.page').then(m => m.EditarPage),
        canActivate: [authGuard]
    },
    {
        path: 'ver-perfil/logros',
        loadComponent: () => import('./perfil/logros/logros.page').then(m => m.LogrosPage),
        canActivate: [authGuard]
    },
    {
        path: 'ver-perfil/firma',
        loadComponent: () => import('./perfil/firma/firma.page').then(m => m.FirmaPage),
        canActivate: [authGuard]
    },
    {
        path: 'ver-conferencias',
        loadComponent: () => import('./conferencias/conferencias.page').then(m => m.ConferenciasPage),
        canActivate: [authGuard]
    },
    {
        path: 'mis-certificados',
        loadComponent: () => import('./certificados/certificados.page').then(m => m.MisCertificadosPage),
        canActivate: [authGuard]
    },
    {
        path: 'confirmar-asistencia',
        loadComponent: () => import('./confirmar-asistencia-qr/confirmar-asistencia-qr.page').then(m => m.ConfirmarAsistenciaQrPage),
        canActivate: [authGuard]
    }
];
