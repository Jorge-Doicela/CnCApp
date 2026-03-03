import { Routes } from '@angular/router';
import { creatorGuard } from '../../core/guards/creator.guard';

/**
 * Rutas del módulo Conferencista.
 * Reutiliza los componentes de Admin bajo el prefijo "conferencista/".
 * Protegidas con creatorGuard (rol: Conferencista o Administrador).
 */
export const CREATOR_ROUTES: Routes = [
    // ── Capacitaciones ──────────────────────────────────────────────
    {
        path: 'conferencista/gestionar-capacitaciones',
        loadComponent: () => import('../admin/capacitaciones/crudcapacitaciones.page').then(m => m.CrudcapacitacionesPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'conferencista/gestionar-capacitaciones/crear',
        loadComponent: () => import('../admin/capacitaciones/crear/crear.page').then(m => m.CrearPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'conferencista/gestionar-capacitaciones/editar/:id',
        loadComponent: () => import('../admin/capacitaciones/editar/editar.page').then(m => m.EditarPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'conferencista/gestionar-capacitaciones/visualizar-inscritos/:id',
        loadComponent: () => import('../admin/capacitaciones/visualizarinscritos/visualizarinscritos.page').then(m => m.VisualizarinscritosPage),
        canActivate: [creatorGuard]
    },

    // ── Certificados ─────────────────────────────────────────────────
    {
        path: 'conferencista/certificados/:Id_Capacitacion',
        loadComponent: () => import('../admin/certificados/certificados.page').then(m => m.CertificadosPage),
        canActivate: [creatorGuard]
    },

    // ── Plantillas ───────────────────────────────────────────────────
    {
        path: 'conferencista/gestionar-plantillas',
        loadComponent: () => import('../admin/plantillas/plantillas.page').then(m => m.PlantillasPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'conferencista/gestionar-plantillas/crear',
        loadComponent: () => import('../admin/plantillas/crear/crear.page').then(m => m.CrearPage),
        canActivate: [creatorGuard]
    },
    {
        path: 'conferencista/gestionar-plantillas/editar/:id',
        loadComponent: () => import('../admin/plantillas/crear/crear.page').then(m => m.CrearPage),
        canActivate: [creatorGuard]
    },

    // ── Alias legacy (creator/*) → redirigir al nuevo prefijo ────────
    {
        path: 'creator/gestionar-capacitaciones',
        redirectTo: 'conferencista/gestionar-capacitaciones',
        pathMatch: 'full'
    },
    {
        path: 'creator/gestionar-capacitaciones/crear',
        redirectTo: 'conferencista/gestionar-capacitaciones/crear',
        pathMatch: 'full'
    },
    {
        path: 'creator/gestionar-plantillas',
        redirectTo: 'conferencista/gestionar-plantillas',
        pathMatch: 'full'
    },
    {
        path: 'creator/gestionar-plantillas/crear',
        redirectTo: 'conferencista/gestionar-plantillas/crear',
        pathMatch: 'full'
    },
];
